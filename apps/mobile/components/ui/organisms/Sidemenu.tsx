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
import { ThemedView } from '@/components/ThemedView';
import { GlobalColors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SIDEMENU_ITEMS } from '@/constants/sidebarItems';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
}

export default function UserAvatar({ firstName, lastName }: UserAvatarProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  // const { theme, toggleTheme } = useColorScheme();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // theme
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const icons = useThemeColor({}, 'icon');

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

      <Modal visible={menuVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <ThemedView style={[styles.sidebar, { backgroundColor }]}>
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
                  <ThemedText style={[styles.roleText, { color: textColor }]}>
                    Coach
                  </ThemedText>
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
                <Pressable key={index} style={styles.menuItem}>
                  <Ionicons name={item.icon} size={24} color={icons} />
                  <ThemedText style={[styles.menuText, { color: textColor }]}>
                    {item.name}
                  </ThemedText>
                </Pressable>
              ))}
              <Separator />
              <View style={styles.footer}>
                <Pressable style={styles.footerItem}>
                  <Text style={[styles.footerText, { color: textColor }]}>
                    Profile
                  </Text>
                </Pressable>
                <Pressable style={styles.footerItem}>
                  <Text style={[styles.footerText, { color: textColor }]}>
                    Settings
                  </Text>
                </Pressable>
                <Pressable style={styles.footerItem}>
                  <Text style={[styles.footerText, { color: textColor }]}>
                    Contact
                  </Text>
                </Pressable>
                <Pressable style={styles.footerItem}>
                  <Text style={[styles.footerText, { color: textColor }]}>
                    Payment
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* <View style={styles.themeToggleContainer}>
              <ThemedText>Dark Mode</ThemedText>
              <Switch value={theme === "dark"} onValueChange={toggleTheme} />
            </View> */}

            <Pressable style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </ThemedView>
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
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    width: '100%',
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  },
  menuItems: {
    marginBottom: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 20,
    marginLeft: 15,
    fontWeight: 'bold',
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
    fontWeight: '600',
    color: '#6D6D6D',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#EAEAEA',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: GlobalColors.red,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
