import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserContext } from '@/context/useUserContext';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import { useQueryClient } from '@tanstack/react-query';
import BomberIcon from '@/assets/images/bomber-icon.png';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import EditProfileContent from '@/app/user/edit-profile';
import ProfileTabs from '@/components/ui/organisms/profile-tab';

export default function ProfileScreen() {
  const { user } = useUserContext();
  const [editVisible, setEditVisible] = useState(false);
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <ScrollView contentContainerStyle={styles.content}>
          <Image source={BomberIcon} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {user.fname} {user.lname}
            </Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{user.primaryRole}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditVisible(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <ProfileTabs />
        </ScrollView>

        <FullScreenModal
          isVisible={editVisible}
          onClose={() => setEditVisible(false)}
          title="Edit Profile"
        >
          <EditProfileContent
            user={user}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['current-user'] });
              setEditVisible(false);
            }}
          />
        </FullScreenModal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
    resizeMode: 'cover',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  editButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
});
