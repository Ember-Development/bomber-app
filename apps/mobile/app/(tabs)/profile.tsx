import React from 'react';
import { SafeAreaView } from 'react-native';
import ProfileHeader from '../profile/header';
import { createProfileStyles } from '@/styles/profileStyle';

export default function Profile() {
  const styles = createProfileStyles();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ProfileHeader />
    </SafeAreaView>
  );
}
