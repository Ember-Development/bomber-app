import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { GlobalColors } from '@/constants/Colors';
import type { UserFE } from '@bomber-app/database';
import { useUserContext } from '@/context/useUserContext';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import EditProfileContent from '@/app/user/edit-profile';
import { api } from '@/api/api';
import DangerConfirmModal from '@/features/teams/dangerconfirm';
import TeamRosterModal from '@/features/teams/TeamRosterModal';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { Alert } from 'react-native';

type UserRole =
  | 'ADMIN'
  | 'REGIONAL_COACH'
  | 'COACH'
  | 'PLAYER'
  | 'PARENT'
  | 'FAN';
type AgeGroup = 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'ALUMNI';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, error, setUser } = useUserContext();
  const [changePwVisible, setChangePwVisible] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    const u = (user as UserFE | undefined) ?? ({} as any);
    const primaryRole: UserRole =
      (u.primaryRole as UserRole) ||
      (u.parent ? 'PARENT' : u.coach ? 'COACH' : u.player ? 'PLAYER' : 'FAN');
    const ageGroup: AgeGroup | undefined = u.player?.ageGroup as
      | AgeGroup
      | undefined;
    const linkedChildrenCount = u.parent?.children?.length ?? 0;
    const coachTeams =
      (u.coach?.teams?.length ?? 0) + (u.coach?.headTeams?.length ?? 0);
    const playerTeams = u.player?.team ? 1 : 0;
    const teamCount = coachTeams || playerTeams || 0;

    return {
      id: u.id,
      role: primaryRole,
      fname: u.fname ?? '',
      lname: u.lname ?? '',
      email: u.email ?? null,
      phone: u.phone ?? null,
      teamCount,
      ageGroup,
      linkedChildrenCount,
    };
  }, [user]);

  const canSeePlayersSection =
    currentUser.role !== 'FAN' && currentUser.role !== 'PLAYER';

  const parentId = currentUser.role === 'PARENT' ? user?.parent?.id : undefined;

  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [teamsVisible, setTeamsVisible] = useState(false);

  const [warnAgeMedia, setWarnAgeMedia] = useState(true);
  const [hideAgeMedia, setHideAgeMedia] = useState(false);

  const handleDeleteAccount = async () => {
    await api.delete('/api/users/me');
    await AsyncStorage.removeItem('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    delete api.defaults.headers.common.Authorization;
    queryClient.clear();
    setUser(null);
    router.replace('/');
  };

  const handleSave = () => {};

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safe}>
        <View className="header" style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ padding: 24 }}>
            <ActivityIndicator />
            <Text style={{ color: '#fff', marginTop: 8 }}>
              Loading your account…
            </Text>
          </View>
        ) : error ? (
          <View style={{ padding: 24 }}>
            <Text style={{ color: '#ff8a8a', marginBottom: 6 }}>
              Couldn’t load your account.
            </Text>
            <Text style={{ color: '#ccc' }}>
              {String((error as any)?.message ?? 'Unknown error')}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Section title="Core">
              <Group title="Profile">
                <Row
                  label="Name"
                  value={`${currentUser.fname ?? ''} ${currentUser.lname ?? ''}`}
                />
                <Row label="Email" value={currentUser.email ?? '—'} />
                <Row label="Phone" value={currentUser.phone ?? '—'} />
                <Row label="Role" value={currentUser.role} />
                {currentUser.teamCount && currentUser.teamCount > 1 ? (
                  <PressLink text="Switch Team Context" onPress={() => {}} />
                ) : null}
                <PressLink
                  text="Edit Profile"
                  onPress={() => setEditVisible(true)}
                />
              </Group>
            </Section>

            <Section title="Privacy & Safety">
              {currentUser.role === 'PARENT' &&
                (currentUser.linkedChildrenCount ?? 0) > 0 && (
                  <Group title="Parental Controls (14U)">
                    <PressLink
                      text="Manage Linked Players"
                      onPress={() => {}}
                    />
                    <ToggleRow
                      label="Hide Age-Restricted Media for Child"
                      value={hideAgeMedia}
                      onValueChange={setHideAgeMedia}
                    />
                  </Group>
                )}
              {canSeePlayersSection && (
                <Group title="Players">
                  <PressLink
                    text="Add Player"
                    onPress={() =>
                      router.push({
                        pathname: '/user/components/add-player-start',
                        params: { parentId: String(parentId ?? '') },
                      })
                    }
                  />
                </Group>
              )}
              <Group title="Media Sensitivity">
                <ToggleRow
                  label="Warn Before Age-Restricted Clips"
                  value={warnAgeMedia}
                  onValueChange={setWarnAgeMedia}
                />
                <ToggleRow
                  label="Hide Age-Restricted Media"
                  value={hideAgeMedia}
                  onValueChange={setHideAgeMedia}
                />
              </Group>
              <Group title="Data Controls">
                {/* <PressLink text="Download My Data" onPress={() => {}} /> */}
                <PressLink
                  text="Change Password"
                  onPress={() => {
                    setPwCurrent('');
                    setPwNew('');
                    setPwConfirm('');
                    setPwError(null);
                    setChangePwVisible(true);
                  }}
                />
                <PressLink
                  text="Delete My Account"
                  onPress={() => setDeleteVisible(true)}
                />
              </Group>
            </Section>

            {(currentUser.role === 'COACH' ||
              currentUser.role === 'REGIONAL_COACH' ||
              currentUser.role === 'ADMIN') && (
              <Section title="Teams & Organization">
                <Group>
                  <PressLink
                    text="My Teams"
                    onPress={() => setTeamsVisible(true)}
                  />
                </Group>
                {/* {(currentUser.role === 'COACH' ||
                  currentUser.role === 'ADMIN') && (
                  <Group title="Manage Team">
                    <PressLink
                      text="Invite Links / Team Code"
                      onPress={() => {}}
                    />
                  </Group>
                )} */}
                {currentUser.role === 'ADMIN' && (
                  <Group title="Organization Tools">
                    <PressLink text="Global Announcements" onPress={() => {}} />
                  </Group>
                )}
              </Section>
            )}

            <Section title="Legal & Help">
              <Group>
                <PressLink
                  text="Terms of Service"
                  onPress={() => router.push('/side/terms')}
                />
                <PressLink
                  text="Privacy Policy"
                  onPress={() => router.push('/side/privacy')}
                />
                <PressLink
                  text="COPPA Notice"
                  onPress={() => router.push('/side/coppa')}
                />
                {(currentUser.role === 'ADMIN' ||
                  currentUser.role === 'COACH' ||
                  currentUser.role === 'REGIONAL_COACH') && (
                  <PressLink
                    text="Coach Responsibilities"
                    onPress={() => router.push('/side/coach-waiver')}
                  />
                )}
                <PressLink
                  text="Contact Support"
                  onPress={() => router.push('/side/contact')}
                />
                <PressLink
                  text="Report a Tech Problem"
                  onPress={() => Linking.openURL('mailto:emberdevco@gmail.com')}
                />
                <Row label="App Version" value="1.0.2 (100)" />
              </Group>
            </Section>

            <View style={{ height: 24 }} />
          </ScrollView>
        )}

        <FullScreenModal
          isVisible={!!editVisible && !!user}
          onClose={() => setEditVisible(false)}
          title="Edit Profile"
        >
          {user ? (
            <EditProfileContent
              user={user}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['current-user'] });
                setEditVisible(false);
              }}
            />
          ) : null}
        </FullScreenModal>

        {user ? (
          <TeamRosterModal
            isVisible={teamsVisible}
            onClose={() => setTeamsVisible(false)}
            user={user}
          />
        ) : null}

        <FullScreenModal
          isVisible={changePwVisible}
          onClose={() => setChangePwVisible(false)}
          title="Change Password"
        >
          <View style={{ padding: 16, gap: 12 }}>
            {pwError ? (
              <Text style={{ color: '#ff8a8a' }}>{pwError}</Text>
            ) : null}
            <CustomInput
              label="Current Password"
              variant="password"
              fullWidth
              secureTextEntry
              value={pwCurrent}
              onChangeText={setPwCurrent}
            />
            <CustomInput
              label="New Password"
              variant="password"
              fullWidth
              secureTextEntry
              description="Must be at least 8 characters"
              value={pwNew}
              onChangeText={setPwNew}
            />
            <CustomInput
              label="Confirm New Password"
              variant="password"
              fullWidth
              secureTextEntry
              value={pwConfirm}
              onChangeText={setPwConfirm}
            />

            <CustomButton
              title={pwSubmitting ? 'Saving…' : 'Save New Password'}
              onPress={async () => {
                setPwError(null);
                if (!pwCurrent || !pwNew || !pwConfirm) {
                  setPwError('Please fill out all fields.');
                  return;
                }
                if (pwNew.length < 8) {
                  setPwError('New password must be at least 8 characters.');
                  return;
                }
                if (pwNew !== pwConfirm) {
                  setPwError('New password and confirmation do not match.');
                  return;
                }

                try {
                  setPwSubmitting(true);
                  await api.post(
                    `/api/users/${currentUser.id}/change-password`,
                    {
                      currentPassword: pwCurrent,
                      newPassword: pwNew,
                    }
                  );
                  setChangePwVisible(false);
                  setPwCurrent('');
                  setPwNew('');
                  setPwConfirm('');
                  Alert.alert(
                    'Password updated',
                    'Your password has been changed.'
                  );
                } catch (e: any) {
                  const msg =
                    e?.response?.data?.error ||
                    e?.message ||
                    'Unable to change password.';
                  setPwError(msg);
                } finally {
                  setPwSubmitting(false);
                }
              }}
              fullWidth
              disabled={pwSubmitting}
            />
          </View>
        </FullScreenModal>

        <DangerConfirmModal
          isVisible={deleteVisible}
          title="Delete Account"
          subtitle="This will deactivate your account and remove access to all teams and data."
          confirmHint={String(currentUser.email ?? '').toLowerCase()}
          onClose={() => setDeleteVisible(false)}
          onConfirm={async () => {
            await handleDeleteAccount();
            setDeleteVisible(false);
          }}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}

function Group({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function PressLink({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress}>
      <Text style={styles.linkText}>{text}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A9A9B6" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.select({ ios: 8, android: 12 }),
    paddingBottom: 8,
  },
  backButton: { padding: 8, marginRight: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  saveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 18 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  group: { marginBottom: 10 },
  groupTitle: {
    color: '#B8B8C3',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { color: '#EDEDF2', fontSize: 14, flex: 1 },
  rowValue: { color: '#A9A9B6', fontSize: 14 },
  linkRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  linkText: { color: '#A9C7FF', fontSize: 14, fontWeight: '600' },
});
