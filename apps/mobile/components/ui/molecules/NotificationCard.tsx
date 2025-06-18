import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import Separator from '../atoms/Seperator';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

// todo: change to database type and add isNew Property
interface Notification {
  id: string;
  message: string;
  timeAgo: string;
  isNew: boolean;
}

// TODO: Replace with real notifications from backend
const notifications: Notification[] = [
  {
    id: '1',
    message: 'New Bomber Merch Released!',
    timeAgo: '2hr ago',
    isNew: true,
  },
  {
    id: '2',
    message: 'Congratulations to our latest alumni commits!',
    timeAgo: '1d ago',
    isNew: false,
  },
  {
    id: '3',
    message: 'Don’t miss the upcoming showcase!',
    timeAgo: '2d ago',
    isNew: false,
  },
];

export default function NotificationCard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationsData, setNotificationsData] = useState(notifications);
  const cardScale = useRef(new Animated.Value(1)).current;

  const modalBackground = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'component');
  const borderColor = useThemeColor({}, 'border');

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const clearAllNotifications = () => {
    setNotificationsData([]);
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View Notifications"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => setModalVisible(true)}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText
              type="subtitle"
              style={[styles.title, { color: textColor }]}
            >
              Recent Notifications
            </ThemedText>
            <Ionicons name="expand-outline" size={20} color={iconColor} />
          </View>
          <Separator />
          <View style={styles.notificationPreview}>
            <ThemedText
              numberOfLines={2}
              style={[styles.notificationText, { color: textColor }]}
            >
              {notifications[0].message}
            </ThemedText>
            <ThemedText style={styles.timeAgo}>
              {notifications[0].timeAgo}
            </ThemedText>
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
                {notificationsData.length > 0 && (
                  <Pressable onPress={clearAllNotifications}>
                    <Ionicons name="trash-outline" size={22} color="red" />
                  </Pressable>
                )}
                <Pressable
                  accessibilityLabel="Close notifications"
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={iconColor} />
                </Pressable>
              </View>
            </View>

            <Separator />

            {notificationsData.length > 0 ? (
              <FlatList
                data={notificationsData}
                keyExtractor={(item) => item.id}
                initialNumToRender={5}
                windowSize={10}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.notificationItem,
                      { borderBottomColor: borderColor },
                    ]}
                  >
                    <View style={styles.notificationRow}>
                      {item.isNew && <View style={styles.newDot} />}
                      <ThemedText
                        numberOfLines={2}
                        style={[
                          { color: textColor },
                          item.isNew && {
                            fontWeight: '700',
                            color: GlobalColors.bomber,
                          },
                        ]}
                      >
                        {item.message}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.timeAgo}>
                      {item.timeAgo}
                    </ThemedText>
                  </View>
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
                <ThemedText
                  type="default"
                  style={{ color: '#888', textAlign: 'center' }}
                >
                  No new notifications right now.
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    padding: 15,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
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
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
      },
      default: {
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
      },
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
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
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GlobalColors.bomber,
  },
});
