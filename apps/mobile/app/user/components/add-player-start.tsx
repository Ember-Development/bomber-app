// app/user/components/add-player-start.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomButton from '@/components/ui/atoms/Button';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { GlobalColors } from '@/constants/Colors';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/api';
import { usePlayers } from '@/hooks/teams/usePlayerById';
import SearchableSelect from '@/components/ui/atoms/SearchableSelect';

type Params = { parentUserId?: string };

export default function AddPlayerStart() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { parentUserId } = useLocalSearchParams<Params>();

  const { data: players, isLoading } = usePlayers();
  const [mode, setMode] = useState<'claim' | 'create' | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<
    string | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canClaim = !!selectedPlayerId && !!parentUserId && !isSubmitting;

  const options = useMemo(() => {
    return (
      players?.map((p: any) => {
        const label =
          `${p?.user?.fname ?? ''} ${p?.user?.lname ?? ''} – ${p?.team?.name ?? 'No Team'} #${p?.jerseyNum ?? ''}`.trim();
        // ensure string IDs (UUIDs)
        return { label, value: String(p.id) };
      }) ?? []
    );
  }, [players]);

  const handleCreateNew = () => {
    router.push({
      pathname: '/user/components/add-new-player',
      params: { parentUserId: String(parentUserId ?? '') },
    });
  };

  const handleClaim = async () => {
    if (!canClaim) return;
    try {
      setIsSubmitting(true);

      const pid = String(selectedPlayerId); // player UUID
      const parId = String(parentUserId); // parent UUID

      // Do ONE call: connect player -> parent
      await api.post(`/api/players/${pid}/parents`, { parentId: parId });

      // Optional: if you *know* you’re logged in as that same parent and want to try
      // to update the parent record too, you could do it as best-effort:
      // try { await api.post(`/api/parents/${parId}/children`, { playerId: pid }); } catch {}

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
        queryClient.invalidateQueries({ queryKey: ['players'] }),
      ]);

      router.replace('/profile');
    } catch (e) {
      console.error('[AddPlayerStart] claim player error:', e);
      setIsSubmitting(false);
    }
  };
  return (
    <BackgroundWrapper>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/')
              }
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back to Profile</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              How would you like to add a player?
            </Text>

            <View style={styles.cardRow}>
              <TouchableOpacity
                style={[
                  styles.bigCard,
                  mode === 'claim' && styles.cardSelected,
                ]}
                onPress={() => setMode('claim')}
              >
                <Text
                  style={[
                    styles.bigCardTitle,
                    mode === 'claim' && styles.cardTitleSelected,
                  ]}
                >
                  Claim an Existing Player
                </Text>
                <Text style={styles.bigCardBody}>
                  Link a player account that already exists in Bomber.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bigCard,
                  mode === 'create' && styles.cardSelected,
                ]}
                onPress={() => setMode('create')}
              >
                <Text
                  style={[
                    styles.bigCardTitle,
                    mode === 'create' && styles.cardTitleSelected,
                  ]}
                >
                  Create a New Player
                </Text>
                <Text style={styles.bigCardBody}>
                  Add a brand new player profile from scratch.
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'claim' && (
              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Select Player to Claim</Text>
                {isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <SearchableSelect
                    label="Search players"
                    options={options}
                    defaultValue={selectedPlayerId}
                    onSelect={(v: string) => setSelectedPlayerId(v)}
                    placeholder="Type a name, team, or #"
                  />
                )}

                <CustomButton
                  title={isSubmitting ? 'Claiming…' : 'Claim Player'}
                  onPress={handleClaim}
                  fullWidth
                  disabled={!canClaim}
                />
                {!parentUserId && (
                  <Text style={styles.helperText}>
                    Missing parentUserId — open this screen from your profile so
                    we know which parent to attach.
                  </Text>
                )}
              </View>
            )}

            {mode === 'create' && (
              <View style={{ marginTop: 24 }}>
                <CustomButton
                  title="Create New Player"
                  onPress={handleCreateNew}
                  fullWidth
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  backButton: { marginBottom: 16 },
  backButtonText: {
    color: GlobalColors.bomber,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  cardRow: { gap: 12 },
  bigCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: 16,
  },
  cardSelected: {
    borderColor: GlobalColors.bomber,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bigCardTitle: {
    color: GlobalColors.white,
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 16,
  },
  cardTitleSelected: { color: GlobalColors.bomber },
  bigCardBody: { color: GlobalColors.gray },
  sectionTitle: {
    color: GlobalColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: { color: GlobalColors.gray, marginTop: 8, fontStyle: 'italic' },
});
