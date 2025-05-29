import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Separator from '../atoms/Seperator';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { GlobalColors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SIDEMENU_ITEMS } from '@/constants/sidebarItems';
import { useRouter } from 'expo-router';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
}

export default function UserAvatar({ firstName, lastName }: UserAvatarProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const textColor = useThemeColor({}, 'text');

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`open menu for ${firstName} ${lastName}`}
        onPress={() => setMenuVisible(true)}
        style={styles.avatar}
      >
        <Text style={[styles.avatarText, { color: textColor }]}>
          {initials}
        </Text>
      </Pressable>

      <Modal visible={menuVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <BlurView intensity={70} tint="dark" style={styles.sidebar}>
            <View style={styles.profileHeader}>
              <View style={styles.profileDetails}>
                <View style={styles.avatarLarge}>
                  <ThemedText
                    style={[styles.avatarTextLarge, { color: textColor }]}
                  >
                    {initials}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText style={[styles.nameText, { color: textColor }]}>
                    {firstName} {lastName}
                  </ThemedText>
                  <ThemedText style={[styles.roleText]}>Coach</ThemedText>
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="close" size={26} color={textColor} />
              </TouchableOpacity>
            </View>

            <Separator marginVertical={4} />

            <View style={styles.menuItems}>
              {SIDEMENU_ITEMS.map((item, index) => (
                <Pressable
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push(item.routes);
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={GlobalColors.bomber}
                  />
                  <ThemedText style={[styles.menuText, { color: textColor }]}>
                    {item.name}
                  </ThemedText>
                </Pressable>
              ))}
              <Separator />
              <View style={styles.footer}>
                {['Profile', 'Settings', 'Contact', 'Payment'].map((text) => (
                  <Pressable key={text} style={styles.footerItem}>
                    <Text style={[styles.footerText, { color: textColor }]}>
                      {text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </BlurView>
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: '100%',
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 20,
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarTextLarge: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 16,
    color: GlobalColors.bomber,
  },
  menuItems: {
    marginBottom: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 12,
    fontWeight: '600',
  },
  footer: {
    marginTop: 10,
    marginBottom: 10,
  },
  footerItem: {
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
