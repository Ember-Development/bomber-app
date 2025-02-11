import React, { useState } from "react";
import { View, StyleSheet, Modal, Pressable, FlatList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import Separator from "../atoms/Seperator";

interface Notification {
  id: string;
  message: string;
  timeAgo: string;
  isNew: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    message: "New Bomber Merch Released to our store!",
    timeAgo: "2hr",
    isNew: true,
  },
  {
    id: "2",
    message:
      "New Bomber Merch has been added to the store! Make sure you don’t miss out",
    timeAgo: "1D ago",
    isNew: false,
  },
  {
    id: "3",
    message:
      "New Bomber Merch has been added to the store! Make sure you don’t miss out",
    timeAgo: "1D ago",
    isNew: false,
  },
];

export default function NotificationCard() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <Pressable style={styles.card} onPress={() => setModalVisible(true)}>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle" style={styles.title}>
            Recent Notifications
          </ThemedText>
          <Ionicons
            name="expand-outline"
            size={20}
            color="#000"
            onPress={() => setModalVisible(true)}
          />
        </View>
        <Separator />
        <ThemedText numberOfLines={2} style={styles.notificationText}>
          {notifications[0].message}
        </ThemedText>
        <ThemedText style={styles.timeAgo}>
          {notifications[0].timeAgo}
        </ThemedText>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Notifications</ThemedText>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>

            <Separator />

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                  {item.isNew && <View style={styles.newDot} />}
                  <View style={styles.notificationMessage}>
                    <ThemedText numberOfLines={2}>{item.message}</ThemedText>
                  </View>
                  <ThemedText style={styles.timeAgo}>{item.timeAgo}</ThemedText>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: "#007BFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    height: "70%",
    width: "100%",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  notificationMessage: {
    flex: 1,
    paddingHorizontal: 10,
  },
  newDot: {
    width: 8,
    height: 8,
    backgroundColor: "#007BFF",
    borderRadius: 4,
    marginRight: 8,
  },
});
