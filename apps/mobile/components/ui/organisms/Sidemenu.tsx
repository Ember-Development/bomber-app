import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Separator from '../atoms/Seperator';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalColors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { SIDEMENU_ITEMS } from '@/constants/sidebarItems';
import { useLogout } from '@/hooks/user/useLogout';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  primaryRole: string;
}

export default function UserAvatar({
  firstName,
  lastName,
  primaryRole,
}: UserAvatarProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const [legacyExpanded, setLegacyExpanded] = useState(false);
  const router = useRouter();
  const logout = useLogout();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const textColor = useThemeColor({}, 'text');
  const displayRole =
    primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1).toLowerCase();

  const role = primaryRole.toUpperCase();
  const isFan = role === 'FAN';
  const canSeeBomberPortal = ['ADMIN', 'REGIONAL_COACH', 'COACH'].includes(
    role
  );

  const navigateAndClose = (path: string) => {
    setMenuVisible(false);
    router.push(path);
  };

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

      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={Platform.OS === 'ios'}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View
          style={[
            styles.modalContainer,
            Platform.OS === 'android' && styles.modalContainerAndroid,
          ]}
        >
          {Platform.OS === 'ios' ? (
            // iOS: pretty blur stays
            <BlurView intensity={70} tint="dark" style={styles.sidebar}>
              <SidebarContent
                textColor={textColor}
                initials={initials}
                onClose={() => setMenuVisible(false)}
                navigateAndClose={navigateAndClose}
                canSeeBomberPortal={canSeeBomberPortal}
                isFan={isFan}
                logout={logout}
                firstName={firstName}
                lastName={lastName}
                displayRole={displayRole}
                mediaExpanded={mediaExpanded}
                setMediaExpanded={setMediaExpanded}
                legacyExpanded={legacyExpanded}
                setLegacyExpanded={setLegacyExpanded}
              />
            </BlurView>
          ) : (
            // ANDROID: solid/gradient panel so nothing shows through
            <View style={[styles.sidebar, styles.androidSidebar]}>
              <LinearGradient
                colors={['#0A2442', '#061A2E']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <SidebarContent
                textColor={textColor}
                initials={initials}
                onClose={() => setMenuVisible(false)}
                navigateAndClose={navigateAndClose}
                canSeeBomberPortal={canSeeBomberPortal}
                isFan={isFan}
                logout={logout}
                firstName={firstName}
                lastName={lastName}
                displayRole={displayRole}
                mediaExpanded={mediaExpanded}
                setMediaExpanded={setMediaExpanded}
                legacyExpanded={legacyExpanded}
                setLegacyExpanded={setLegacyExpanded}
              />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

/** Extracted so we can reuse for iOS/Android containers above */
function SidebarContent(props: {
  textColor: string;
  initials: string;
  onClose: () => void;
  navigateAndClose: (p: string) => void;
  canSeeBomberPortal: boolean;
  isFan: boolean;
  logout: () => Promise<void>;
  firstName: string;
  lastName: string;
  displayRole: string;
  mediaExpanded: boolean;
  setMediaExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  legacyExpanded: boolean;
  setLegacyExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    textColor,
    initials,
    onClose,
    navigateAndClose,
    canSeeBomberPortal,
    isFan,
    logout,
    firstName,
    lastName,
    displayRole,
    mediaExpanded,
    setMediaExpanded,
    legacyExpanded,
    setLegacyExpanded,
  } = props;

  return (
    <>
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
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
              <ThemedText style={styles.roleText}>{displayRole}</ThemedText>
            </View>
          </View>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={26} color={textColor} />
          </Pressable>
        </View>

        <Separator marginVertical={4} />

        {/* Dynamic menu items */}
        {SIDEMENU_ITEMS.filter((item) => {
          if (item.name === 'Bomber Portal' && !canSeeBomberPortal)
            return false;
          if (item.name === 'Coaches Development' && !canSeeBomberPortal)
            return false;
          if (item.name === 'Player Development' && isFan) return false;
          return true;
        }).map((item) => {
          // Media submenu
          if (item.name === 'Media') {
            return (
              <React.Fragment key="media">
                <Pressable
                  style={styles.menuItem}
                  onPress={() => setMediaExpanded((p) => !p)}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={GlobalColors.bomber}
                  />
                  <ThemedText style={[styles.menuText, { color: textColor }]}>
                    {item.name}
                  </ThemedText>
                  <Ionicons
                    name={mediaExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={textColor}
                    style={{ marginLeft: 'auto' }}
                  />
                </Pressable>
                {mediaExpanded && (
                  <View style={styles.subMenu}>
                    <Pressable
                      style={styles.subMenuItem}
                      onPress={() => navigateAndClose('/side/videos')}
                    >
                      <Ionicons
                        name="videocam-outline"
                        size={20}
                        color={GlobalColors.bomber}
                      />
                      <ThemedText
                        style={[styles.subMenuText, { color: textColor }]}
                      >
                        Videos
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={styles.subMenuItem}
                      onPress={() => navigateAndClose('/side/articles')}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={GlobalColors.bomber}
                      />
                      <ThemedText
                        style={[styles.subMenuText, { color: textColor }]}
                      >
                        Articles
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </React.Fragment>
            );
          }

          // Legacy submenu
          if (item.name === 'Legacy') {
            return (
              <React.Fragment key="legacy">
                <Pressable
                  style={styles.menuItem}
                  onPress={() => setLegacyExpanded((p) => !p)}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={GlobalColors.bomber}
                  />
                  <ThemedText style={[styles.menuText, { color: textColor }]}>
                    {item.name}
                  </ThemedText>
                  <Ionicons
                    name={legacyExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={textColor}
                    style={{ marginLeft: 'auto' }}
                  />
                </Pressable>
                {legacyExpanded && (
                  <View style={styles.subMenu}>
                    <Pressable
                      style={styles.subMenuItem}
                      onPress={() => navigateAndClose('/side/history')}
                    >
                      <Ionicons
                        name="book-outline"
                        size={20}
                        color={GlobalColors.bomber}
                      />
                      <ThemedText
                        style={[styles.subMenuText, { color: textColor }]}
                      >
                        History
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={styles.subMenuItem}
                      onPress={() => navigateAndClose('/side/alumnis')}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color={GlobalColors.bomber}
                      />
                      <ThemedText
                        style={[styles.subMenuText, { color: textColor }]}
                      >
                        Alumnis
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={styles.subMenuItem}
                      onPress={() => navigateAndClose('/side/commitments')}
                    >
                      <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color={GlobalColors.bomber}
                      />
                      <ThemedText
                        style={[styles.subMenuText, { color: textColor }]}
                      >
                        Commitments
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </React.Fragment>
            );
          }

          // Default items
          return (
            <Pressable
              key={item.name}
              style={styles.menuItem}
              onPress={() => item.routes && navigateAndClose(item.routes)}
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
          );
        })}

        <Separator marginVertical={12} />

        {/* Footer links */}
        <View style={styles.footer}>
          {['Profile', 'Settings', 'Contact', 'Payment']
            .filter((text) => !(isFan && text === 'Payment'))
            .map((text) => (
              <Pressable
                key={text}
                style={styles.footerItem}
                onPress={() => {
                  switch (text) {
                    case 'Profile':
                      return navigateAndClose('/profile');
                    case 'Settings':
                      return navigateAndClose('/settings');
                    case 'Contact':
                      return navigateAndClose('/side/contact');
                    case 'Payment':
                      return Linking.openURL(
                        'https://bomberpayments.net'
                      ).catch(console.error);
                  }
                }}
              >
                <Text style={[styles.footerText, { color: textColor }]}>
                  {text}
                </Text>
              </Pressable>
            ))}
        </View>
      </ScrollView>

      {/* Logout button fixed at bottom */}
      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          onClose();
          await logout();
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
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
    // iOS overlay behind the blur (keeps iOS behavior)
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  // ANDROID: opaque background so nothing from previous screen bleeds through
  modalContainerAndroid: {
    backgroundColor: '#061A2E', // deep navy (not pure black)
  },
  sidebar: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 26 : 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', // iOS: works with blur
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  // ANDROID: solid/gradient panel
  androidSidebar: {
    backgroundColor: '#071F38',
  },
  scrollArea: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 30,
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
  subMenu: {
    marginLeft: 36,
    marginBottom: 12,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  subMenuText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  footer: {
    marginBottom: 24,
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
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 30,
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
