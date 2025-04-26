import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import Separator from '../atoms/Seperator';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

interface Notification {
  id: string;
  message: string;
  timeAgo: string;
  isNew: boolean;
}

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

  const cardBackground = useThemeColor({}, 'component');
  const modalBackground = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
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
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => setModalVisible(true)}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: cardBackground,
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
          <View
            style={[styles.modalContent, { backgroundColor: modalBackground }]}
          >
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
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={iconColor} />
                </Pressable>
              </View>
            </View>

            <Separator />

            {notificationsData.length > 0 ? (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
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
                            color: GlobalColors.blue,
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
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
    color: GlobalColors.blue,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    height: '75%',
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18,
    backgroundColor: '#fff',
  },
  dragHandle: {
    alignSelf: 'center',
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
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
    paddingVertical: 12,
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
    backgroundColor: GlobalColors.blue,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});
