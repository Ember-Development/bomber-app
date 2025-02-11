import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Separator from "../atoms/Seperator";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
}

export default function UserAvatar({ firstName, lastName }: UserAvatarProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <>
      <Pressable onPress={() => setMenuVisible(true)} style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </Pressable>

      <Modal visible={menuVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.sidebar}>
            <View style={styles.profileHeader}>
              <View style={styles.profileDetails}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarTextLarge}>{initials}</Text>
                </View>
                <View>
                  <Text style={styles.nameText}>
                    {firstName} {lastName}
                  </Text>
                  <Text style={styles.roleText}>Coach</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={26} color="black" />
              </TouchableOpacity>
            </View>

            <Separator marginVertical={4} />

            <View style={styles.menuItems}>
              {[
                {
                  name: "Teams",
                  icon: "people-outline" as keyof typeof Ionicons.glyphMap,
                },
                {
                  name: "Media",
                  icon: "play-outline" as keyof typeof Ionicons.glyphMap,
                },
                {
                  name: "Legacy",
                  icon: "school-outline" as keyof typeof Ionicons.glyphMap,
                },
                {
                  name: "Bomber Portal",
                  icon: "book-outline" as keyof typeof Ionicons.glyphMap,
                },
                {
                  name: "About Us",
                  icon: "flag-outline" as keyof typeof Ionicons.glyphMap,
                },
                {
                  name: "Player Development",
                  icon: "star-outline" as keyof typeof Ionicons.glyphMap,
                },
              ].map((item, index) => (
                <Pressable key={index} style={styles.menuItem}>
                  <Ionicons name={item.icon} size={24} color="black" />
                  <Text style={styles.menuText}>{item.name}</Text>
                </Pressable>
              ))}
              <Separator />
              <View style={styles.footer}>
                <Pressable style={styles.footerItem}>
                  <Text style={styles.footerText}>Profile</Text>
                </Pressable>
                <Pressable style={styles.footerItem}>
                  <Text style={styles.footerText}>Settings</Text>
                </Pressable>
                <Pressable style={styles.footerItem}>
                  <Text style={styles.footerText}>Contact</Text>
                </Pressable>
                <Pressable style={styles.footerItem}>
                  <Text style={styles.footerText}>Payment</Text>
                </Pressable>
              </View>
            </View>
            <Pressable style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sidebar: {
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 20,
  },
  profileDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarTextLarge: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  roleText: {
    fontSize: 16,
    color: "#6D6D6D",
  },
  menuItems: {
    marginBottom: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 20,
    marginLeft: 15,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 10,
    marginBottom: 10,
  },
  footerItem: {
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "semibold",
    color: "#6D6D6D",
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 60,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
