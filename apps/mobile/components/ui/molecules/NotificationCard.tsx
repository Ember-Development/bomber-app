import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Animated,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import Separator from '../atoms/Seperator';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';
import * as Linking from 'expo-linking';
import { api } from '@/api/api';
import { timeAgo } from '@/utils/timeAgo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserContext } from '@/context/useUserContext';
import { useNotificationsFeed } from '@/hooks/notifications/useNotifications';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import ViewEvent from '@/app/events/modals/ViewEvent';

type FeedItem = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  deepLink?: string | null;
  sentAt: string; // ISO
};

/* ------------------------- Persistence helpers ------------------------- */

const KEY_CLEARED_UNTIL = 'notifications:clearedUntil';
const KEY_DISMISSED_IDS = 'notifications:dismissedIds';

async function getDismissals() {
  const [untilRaw, idsRaw] = await Promise.all([
    AsyncStorage.getItem(KEY_CLEARED_UNTIL),
    AsyncStorage.getItem(KEY_DISMISSED_IDS),
  ]);
  const clearedUntil = untilRaw ? Number(untilRaw) : 0;
  const dismissedIds: Record<string, true> = idsRaw ? JSON.parse(idsRaw) : {};
  return { clearedUntil, dismissedIds };
}

async function setClearedUntil(ms: number) {
  await AsyncStorage.setItem(KEY_CLEARED_UNTIL, String(ms));
}

async function addDismissedId(id: string) {
  const idsRaw = (await AsyncStorage.getItem(KEY_DISMISSED_IDS)) || '{}';
  const ids = JSON.parse(idsRaw) as Record<string, true>;
  ids[id] = true;
  await AsyncStorage.setItem(KEY_DISMISSED_IDS, JSON.stringify(ids));
}

async function clearDismissedIds() {
  await AsyncStorage.setItem(KEY_DISMISSED_IDS, '{}');
}

/* ---------------------------------------------------------------------- */

export default function NotificationCard() {
  const { user } = useUserContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();

  // dismissal state (hydrated from AsyncStorage)
  const [clearedUntil, setClearedUntilState] = useState<number>(0);
  const [dismissedIds, setDismissedIds] = useState<Record<string, true>>({});

  const cardScale = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const compact = width < 340;

  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'component');
  const borderColor = useThemeColor({}, 'border');

  // Use React Query hook for notifications - only fetch if user is logged in
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useNotificationsFeed(true, !!user);

  // hydrate local dismissal state on mount
  useEffect(() => {
    (async () => {
      const { clearedUntil, dismissedIds } = await getDismissals();
      setClearedUntilState(clearedUntil);
      setDismissedIds(dismissedIds);
    })();
  }, []);

  // Apply dismissals to notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const sentAtMs = new Date(n.sentAt).getTime();
      if (clearedUntil && sentAtMs <= clearedUntil) return false;
      if (dismissedIds[n.id]) return false;
      return true;
    });
  }, [notifications, clearedUntil, dismissedIds]);

  // Don't show notifications if user is not logged in
  if (!user) {
    return null;
  }

  const top = filteredNotifications[0];
  const topPreview = useMemo(() => {
    if (isLoading) return { line1: 'Loading…', time: '' };
    if (error) return { line1: 'Unable to load notifications', time: '' };
    if (!top) return { line1: 'No notifications yet', time: '' };
    return { line1: top.title || top.body, time: timeAgo(top.sentAt) };
  }, [top, isLoading, error]);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }).start();
  };

  // Helper to extract event ID from deep links
  const extractEventId = (deepLink: string): string | null => {
    // Handle formats like: bomber://event/123, bomber://events/123, /events/123
    const eventMatch = deepLink.match(/(?:event|events)\/([a-zA-Z0-9-]+)/);
    return eventMatch ? eventMatch[1] : null;
  };

  // --- Mark single item as opened (persist locally so it stays hidden)
  const onTapItem = useCallback(
    async (id: string, deepLink?: string | null) => {
      try {
        // Check if it's an event link
        if (deepLink) {
          const eventId = extractEventId(deepLink);
          if (eventId) {
            // Open event modal
            setSelectedEventId(eventId);
            setModalVisible(false);
          } else {
            // Open other deep links normally
            Linking.openURL(deepLink).catch(() => {});
            setModalVisible(false);
          }
        } else {
          setModalVisible(false);
        }

        // best-effort server call (ok if public/no-op)
        await api
          .post('/api/notifications/receipt/open', { notificationId: id })
          .catch(() => {});
        // persist dismissal
        await addDismissedId(id);
        setDismissedIds((prev) => ({ ...prev, [id]: true }));
      } catch (e) {
        console.error('Failed to mark opened', e);
      }
    },
    []
  );

  // --- Mark all as read (persist cutoff so older items never show again)
  const clearAll = useCallback(async () => {
    try {
      // best-effort server call (ok if it's a no-op)
      await api.post('/api/notifications/readAll', {}).catch(() => {});
      const now = Date.now();
      await setClearedUntil(now);
      await clearDismissedIds();
      setClearedUntilState(now);
      setDismissedIds({});
      // Refetch to get updated data
      refetch();
    } catch (e) {
      console.error('Failed to clear all notifications', e);
    }
  }, [refetch]);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View Notifications"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => setModalVisible(true)}
        android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: false }}
        style={{ borderRadius: 18, overflow: 'hidden' }}
      >
        <Animated.View
          style={[styles.card, { transform: [{ scale: cardScale }] }]}
        >
          <View
            style={[styles.cardHeader, compact && styles.cardHeaderCompact]}
          >
            <ThemedText
              type="subtitle"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.title,
                compact && styles.titleCompact,
                { color: textColor },
              ]}
            >
              Notifications
            </ThemedText>

            <Pressable
              onPress={() => setModalVisible(true)}
              hitSlop={10}
              android_ripple={{
                color: 'rgba(255,255,255,0.08)',
                borderless: true,
              }}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Expand notifications"
            >
              <Ionicons name="expand-outline" size={20} color={iconColor} />
            </Pressable>
          </View>

          <Separator />

          <View style={styles.notificationPreview}>
            <ThemedText
              numberOfLines={2}
              style={[styles.notificationText, { color: textColor }]}
            >
              {topPreview.line1}
            </ThemedText>
            {!!topPreview.time && (
              <ThemedText style={styles.timeAgo}>{topPreview.time}</ThemedText>
            )}
          </View>
        </Animated.View>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent]}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={{ color: textColor }}>
                Notifications
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {filteredNotifications.length > 0 && (
                  <Pressable onPress={clearAll}>
                    <Ionicons name="trash-outline" size={22} color="red" />
                  </Pressable>
                )}
                <Pressable onPress={() => refetch()}>
                  <Ionicons name="refresh" size={22} color={iconColor} />
                </Pressable>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={iconColor} />
                </Pressable>
              </View>
            </View>

            <Separator />

            {isLoading ? (
              <View style={styles.emptyNotifications}>
                <ThemedText type="subtitle">Loading…</ThemedText>
              </View>
            ) : error ? (
              <View style={styles.emptyNotifications}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#ccc"
                  style={{ marginBottom: 12 }}
                />
                <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                  Unable to load notifications
                </ThemedText>
              </View>
            ) : filteredNotifications.length > 0 ? (
              <FlatList
                data={filteredNotifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable onPress={() => onTapItem(item.id, item.deepLink)}>
                    <View
                      style={[
                        styles.notificationItem,
                        { borderBottomColor: borderColor },
                      ]}
                    >
                      <View style={styles.notificationRow}>
                        <View style={{ flex: 1, gap: 6 }}>
                          <ThemedText
                            style={{ color: textColor, fontWeight: '600' }}
                          >
                            {item.title}
                          </ThemedText>
                          <ThemedText
                            style={{ color: textColor, opacity: 0.9 }}
                          >
                            {item.body}
                          </ThemedText>
                          {!!item.imageUrl && (
                            <Image
                              source={{ uri: item.imageUrl }}
                              style={{
                                width: '100%',
                                height: 120,
                                borderRadius: 10,
                                marginTop: 6,
                              }}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                      </View>
                      <ThemedText style={styles.timeAgo}>
                        {timeAgo(item.sentAt)}
                      </ThemedText>
                    </View>
                  </Pressable>
                )}
              />
            ) : (
              <View style={styles.emptyNotifications}>
                <Ionicons
                  name="notifications-off-outline"
                  size={64}
                  color="#ccc"
                  style={{ marginBottom: 16 }}
                />
                <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                  You're all caught up!
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Event Modal */}
      <FullScreenModal
        isVisible={Boolean(selectedEventId)}
        onClose={() => setSelectedEventId(undefined)}
        title="Event"
      >
        <ViewEvent eventId={selectedEventId} />
      </FullScreenModal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 15,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    ...(Platform.OS === 'android'
      ? {
          backgroundColor: 'rgba(12, 28, 48, 0.9)',
        }
      : null),
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  cardHeaderCompact: {
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  titleCompact: {
    fontSize: 14,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 12,
    overflow: Platform.select({ android: 'hidden', default: 'visible' }),
  },
  notificationPreview: {
    marginTop: 8,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 6,
  },
  timeAgo: {
    fontSize: 12,
    color: GlobalColors.bomber,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    height: '75%',
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    ...Platform.select({
      web: { backdropFilter: 'blur(16px)' },
      default: { backgroundColor: 'rgba(30, 30, 30, 0.9)' },
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GlobalColors.bomber,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 6,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 50,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 5,
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  notificationItem: {
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    opacity: 0.8,
  },
  notificationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GlobalColors.bomber,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
