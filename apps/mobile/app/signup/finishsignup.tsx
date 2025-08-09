import React, { useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserContext } from '@/context/useUserContext';
import { usePlayerById } from '@/hooks/teams/usePlayerById';
import { GlobalColors } from '@/constants/Colors';
import { api } from '@/api/api';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import EditPlayerContent from '../user/components/edit-player-form';

export default function FinishSignupScreen() {
  const { user, setUser } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user]);

  useEffect(() => {
    if (
      user &&
      (user.primaryRole !== 'PLAYER' || user.phone !== '0000000000')
    ) {
      router.replace('/');
    }
  }, [user]);

  const playerId = user?.player?.id ?? '';
  const { data: player, isLoading, isError } = usePlayerById(playerId);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: GlobalColors.white }}>Loading…</Text>
      </View>
    );
  }

  if (isError || !player) {
    return (
      <View style={styles.center}>
        <Text style={{ color: GlobalColors.red }}>
          Could not load your player data.
        </Text>
      </View>
    );
  }

  // 5) When the player is present, render your form
  const handleSuccess = async () => {
    const { data: me } = await api.get('/api/auth/me');
    setUser(me);
    router.replace('/');
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.wrapper}>
        <Text style={styles.header}>Let's Complete Your Profile Signup</Text>
        <EditPlayerContent player={player} onSuccess={handleSuccess} />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 16 },
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: GlobalColors.white,
    marginTop: 40,
    marginBottom: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
