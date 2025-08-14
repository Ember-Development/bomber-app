import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomSelect from '@/components/ui/atoms/dropdown';
import DateOfBirthInput from '@/components/ui/atoms/DOBInput';
import Checkbox from '@/components/ui/atoms/Checkbox';
import CodeInput from '@/components/ui/organisms/TeamCode';
import CustomButton from '@/components/ui/atoms/Button';
import SchoolInput from '@/components/ui/atoms/SchoolInput';
import { useTeamByCode } from '@/hooks/teams/useTeams';
import { usePlayerSignup } from '@/context/PlayerSignupContext';
import { useParentSignup } from '@/context/ParentSignupContext';
import {
  POSITIONS,
  JERSEY_SIZES,
  PANT_SIZES,
  STIRRUP_SIZES,
  SHORTS_SIZES,
} from '@/utils/enumOptions';
import { GlobalColors } from '@/constants/Colors';
import { UserFE } from '@bomber-app/database';
import { api } from '@/api/api';
import { useCoachSignup } from '@/context/CoachSignupContext';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import type { FlatSchool } from '@/utils/SchoolUtil';
import { US_STATES } from '@/utils/state';

export default function AddNewPlayersScreen() {
  const router = useRouter();

  // Parent ID passed from profile (preferred), falls back to context later
  const { parentUserId } = useLocalSearchParams<{ parentUserId?: string }>();

  const queryClient = useQueryClient();

  const { signupData: playerData } = usePlayerSignup();
  const { signupData: parentData } = useParentSignup();
  const { signupData: coachData } = useCoachSignup();

  // form + added players
  type FormState = {
    teamCode?: string;
    teamName?: string | null;
    ageDivision?: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | string | null;

    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dob?: string;
    password?: string;
    confirmPass?: string;

    sameAsParent?: boolean;
    address?: string;
    state?: string;
    city?: string;
    zip?: string;

    pos1?: string;
    pos2?: string;
    jerseyNum?: string;
    gradYear?: string;

    committed?: boolean;
    college?: string;
    commitId?: string;

    jerseySize?: string | null;
    pantSize?: string | null;
    stirrupSize?: string | null;
    shortSize?: string | null;
    practiceShirtSize?: string | null;

    isTrusted?: boolean;
    role?: string;
  };

  const [form, setForm] = useState<FormState>({ teamCode: '' });
  const [players, setPlayers] = useState<FormState[]>([]);

  // flow state
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<'parent' | 'self' | null>(null);
  const [isLinkFlow, setIsLinkFlow] = useState(false);
  const [isParentFlow, setIsParentFlow] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // College/commit UI (mirrors add-player.tsx)
  const [committed, setCommitted] = useState(!!form.college);
  const [college, setCollege] = useState(form.college ?? '');
  const [collegeSchool, setCollegeSchool] = useState<FlatSchool | undefined>(
    undefined
  );
  const [commitDate, setCommitDate] = useState<string>('');

  useEffect(() => {
    if (!committed) {
      setCollege('');
      setCollegeSchool(undefined);
      setCommitDate('');
      setForm((f) => ({
        ...f,
        committed: false,
        college: '',
        commitId: undefined,
      }));
    }
  }, [committed]);

  const validPass = (p?: string, c?: string) =>
    !!p && !!c && p.length >= 8 && p === c;

  // back handler (within the multi-step flow)
  const handleBack = () => {
    if (step === 2) {
      setIsLinkFlow(false);
      setIsParentFlow(false);
      setSelection(null);
    }
    setStep((s) => Math.max(1, s - 1));
  };

  // fetch team details
  const { data: teamData } = useTeamByCode(form.teamCode || '');
  useEffect(() => {
    if (teamData) {
      setForm((f) => ({
        ...f,
        teamName: teamData.name,
        ageDivision: teamData.ageGroup,
      }));
    } else {
      setForm((f) => ({
        ...f,
        teamName: null,
        ageDivision: null,
      }));
    }
  }, [teamData]);

  // determine number of steps
  const totalSteps = useMemo(() => {
    if (['U16', 'U18'].includes(form.ageDivision || '')) return 2;
    if (form.ageDivision === 'U14' && isLinkFlow) return 2;
    return 4;
  }, [form.ageDivision, isLinkFlow]);

  // validation
  const isStepValid = () => {
    if (step === 1) return !!form.teamName;

    if (
      step === 2 &&
      (['U8', 'U10', 'U12'].includes(form.ageDivision || '') ||
        (form.ageDivision === 'U14' && isParentFlow))
    ) {
      return (
        !!form.firstName &&
        !!form.lastName &&
        !!form.dob &&
        !!form.password &&
        !!form.confirmPass &&
        validPass(form.password, form.confirmPass)
      );
    }

    if (
      step === 2 &&
      form.ageDivision === 'U14' &&
      !isLinkFlow &&
      !isParentFlow
    ) {
      return selection !== null;
    }

    if (
      step === 2 &&
      (['U16', 'U18'].includes(form.ageDivision || '') || isLinkFlow)
    ) {
      return (
        !!form.firstName &&
        !!form.lastName &&
        !!form.email &&
        !!form.password &&
        !!form.confirmPass &&
        validPass(form.password, form.confirmPass)
      );
    }

    if (step === 3) {
      const base = form.pos1 && form.pos2 && form.jerseyNum && form.gradYear;
      return committed ? !!base && !!college : !!base;
    }

    if (step === 4) {
      return (
        !!form.jerseySize &&
        !!form.pantSize &&
        !!form.stirrupSize &&
        !!form.shortSize &&
        !!form.practiceShirtSize
      );
    }

    return false;
  };

  // next / add player
  const handleNext = async () => {
    if (!isStepValid()) return;

    // U14 branching
    if (
      step === 2 &&
      form.ageDivision === 'U14' &&
      selection === 'self' &&
      !isLinkFlow
    ) {
      setIsLinkFlow(true);
      return;
    }
    if (
      step === 2 &&
      form.ageDivision === 'U14' &&
      selection === 'parent' &&
      !isParentFlow
    ) {
      setIsParentFlow(true);
      return;
    }

    // SPORT step: create Commit if needed (matches add-player.tsx)
    if (step === 3) {
      if (committed && collegeSchool) {
        try {
          const payload = {
            name: collegeSchool.name,
            state: collegeSchool.state ?? '',
            city: collegeSchool.city ?? '',
            imageUrl: collegeSchool.imageUrl ?? '',
            committedDate: commitDate ? new Date(commitDate) : new Date(),
          };
          const { data: created } = await api.post('/api/commits', payload);
          setForm((f) => ({
            ...f,
            committed: true,
            college: collegeSchool.name,
            commitId: created.id,
          }));
        } catch (err) {
          console.error('[ADD NEW PLAYERS] Commit create error:', err);
          setForm((f) => ({
            ...f,
            committed: false,
            college: '',
            commitId: undefined,
          }));
        }
      } else {
        setForm((f) => ({
          ...f,
          committed: false,
          college: '',
          commitId: undefined,
        }));
      }
    }

    // Advance or finalize this player
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      const age = form.ageDivision || '';

      const isParentFill = age === 'U14' && isParentFlow;
      const isSelfFill = age === 'U14' && isLinkFlow;

      const isUnderage = ['U8', 'U10', 'U12'].includes(age) || isParentFill;
      const isAdultLink = ['U16', 'U18'].includes(age) || isSelfFill;

      const isTrusted = ['U16', 'U18'].includes(age) || isSelfFill;
      const isNotTrusted = !isTrusted;

      const athlete = isUnderage
        ? {
            ...form,
            email:
              form.email ||
              `${form.teamCode?.toLowerCase()}+${Math.random()
                .toString(36)
                .slice(2, 6)}@bomber.app`,
            phone: form.phone || '1111111111',
            isTrusted: isNotTrusted,
          }
        : isAdultLink
          ? {
              ...form,
              role: form.role || 'PLAYER',
              teamCode: form.teamCode || '',
              teamName: form.teamName || '',
              ageDivision: form.ageDivision || '',

              firstName: form.firstName || 'TBD',
              lastName: form.lastName || 'Player',
              email:
                form.email ||
                `${form.teamCode?.toLowerCase()}+${Math.random()
                  .toString(36)
                  .slice(2, 6)}@bomber.app`,
              phone: form.phone || '0000000000',
              dob: form.dob || '2005-01-01',
              password: form.password || 'TempPass123!',
              confirmPass: form.confirmPass || 'TempPass123!',

              address: form.address || '123 Main St',
              city: form.city || 'Anytown',
              state: form.state || 'Texas',
              zip: form.zip || '00000',

              // sport defaults (valid Prisma enums)
              pos1: form.pos1 || 'PITCHER',
              pos2: form.pos2 || 'FIRST_BASE',
              jerseyNum: form.jerseyNum || '0',
              gradYear: form.gradYear || `${new Date().getFullYear()}`,
              committed: committed ?? false,
              college: college || '',

              // gear defaults
              jerseySize: form.jerseySize || 'AM',
              pantSize: form.pantSize || 'SIZE_20',
              stirrupSize: form.stirrupSize || 'SM',
              shortSize: form.shortSize || 'ASM',
              practiceShirtSize: form.practiceShirtSize || 'ASM',
              isTrusted: isTrusted,
            }
          : form;

      setPlayers((prev) => {
        if (editingIndex !== null) {
          const next = [...prev];
          next[editingIndex] = athlete;
          return next;
        }
        return [...prev, athlete];
      });

      // reset form state for next player (keep team context)
      setForm({ teamCode: form.teamCode });
      setSelection(null);
      setIsLinkFlow(false);
      setIsParentFlow(false);
      setEditingIndex(null);
      setCollegeSchool(undefined);
      setCommitted(false);
      setCollege('');
      setCommitDate('');
      setShowSummary(true);
      setStep(1);
    }
  };

  const handleAddAnother = () => setShowSummary(false);
  const handleDeletePlayer = (idx: number) =>
    setPlayers((prev) => prev.filter((_, i) => i !== idx));

  const handleEditPlayer = (ath: FormState, idx: number) => {
    setForm({ ...ath });
    setCommitted(!!ath.college);
    setCollege(ath.college ?? '');
    setCollegeSchool(undefined);
    setShowSummary(false);

    const { ageDivision, isTrusted } = ath;
    if (isTrusted || ['U14', 'U16', 'U18'].includes(String(ageDivision))) {
      setIsLinkFlow(true);
      setIsParentFlow(false);
    } else {
      setIsLinkFlow(false);
      setIsParentFlow(true);
    }

    setSelection(null);
    setEditingIndex(idx);
    setStep(2);
  };

  const handleSubmitAll = async () => {
    try {
      const parentId =
        (parentUserId as string | undefined) ?? parentData.parentId;
      const parentAddrId = parentData.addressID;

      if (!parentId) {
        throw new Error(
          'Parent ID missing – make sure you completed the Parent signup first'
        );
      }

      for (const ath of players) {
        let athleteAddrId: string | undefined;

        if (ath.sameAsParent && parentAddrId) {
          athleteAddrId = parentAddrId;
        } else if (ath.address && ath.city && ath.state && ath.zip) {
          const { data: newAddr } = await api.post('/api/users/address', {
            address1: ath.address,
            city: ath.city,
            state: ath.state,
            zip: ath.zip,
          });
          athleteAddrId = newAddr.id;
        }

        const playerPayload = {
          email: ath.email,
          password: (ath as any).pass ?? ath.password,
          fname: ath.firstName,
          lname: ath.lastName,
          role: 'PLAYER',
          phone: ath.phone,
          player: {
            pos1: ath.pos1!,
            pos2: ath.pos2!,
            jerseyNum: ath.jerseyNum!,
            gradYear: ath.gradYear!,
            ageGroup: ath.ageDivision!,
            jerseySize: ath.jerseySize || 'AM',
            pantSize: ath.pantSize || 'SIZE_20',
            stirrupSize: ath.stirrupSize || 'SM',
            shortSize: ath.shortSize || 'ASM',
            practiceShortSize: ath.practiceShirtSize || 'ASM',
            isTrusted: ath.isTrusted,
            college: ath.college,
            ...(ath.commitId
              ? { commit: { connect: { id: ath.commitId } } }
              : {}),
            team: { connect: { teamCode: ath.teamCode! } },
            parents: { connect: { id: parentId } },
            ...(athleteAddrId
              ? { address: { connect: { id: athleteAddrId } } }
              : {}),
          },
        };

        try {
          await api.post('/api/auth/signup', playerPayload);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.error('[ADD NEW PLAYERS] Signup flow error:');
            console.error('  URL:', err.config?.url);
            console.error('  Method:', err.config?.method);
            console.error('  Payload:', err.config?.data);
            console.error('  Status:', err.response?.status);
            console.error('  Status Text:', err.response?.statusText);
            console.error('  Response Data:', err.response?.data);
          } else {
            console.error('[ADD NEW PLAYERS] Unexpected error:', err);
          }
        }
      }

      const { data: me } = await api.get<UserFE>('/api/auth/me');
      queryClient.setQueryData(['currentUser'], me);
      router.replace('/profile');
    } catch (err: any) {
      console.error('[ADD NEW PLAYERS] Signup flow error:', err);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.stepContainer}>
          {/* Back to Profile on team-code step */}
          <TouchableOpacity
            style={{
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => router.replace('/profile')}
          >
            <Text style={{ fontSize: 18, color: '#fff' }}>
              ← Back to Profile
            </Text>
          </TouchableOpacity>

          <Text style={styles.titleStep}>
            Step 1 of {totalSteps}: Enter Team Code
          </Text>
          <Text style={styles.Title}>
            Lets Start and Link your Bomber Players
          </Text>
          <Text style={styles.instructions}>
            Start by entering the 5-character code you received in your Bomber
            Welcome email for your player.
          </Text>
          <Text style={styles.instructions}>
            Bomber codes are unique make sure the team code matches for your
            players team.
          </Text>

          <CodeInput
            length={5}
            onChange={(code) => {
              const up = code.toUpperCase();
              setForm((f) => ({ ...f, teamCode: up }));
            }}
          />

          {form.teamName && (
            <View style={styles.selectedTeamContainer}>
              <Text style={styles.selectedLabel}>Team:</Text>
              <Text style={styles.selectedTeamText}>
                {form.teamName} ({form.ageDivision})
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (
      step === 2 &&
      form.ageDivision === 'U14' &&
      !isLinkFlow &&
      !isParentFlow
    ) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.instructions}>
            14U teams need a choice—who fills out player info?
          </Text>
          <TouchableOpacity
            style={[styles.card, selection === 'parent' && styles.cardSelected]}
            onPress={() => setSelection('parent')}
          >
            <Text
              style={[
                styles.cardLabel,
                selection === 'parent' && styles.cardLabelSelected,
              ]}
            >
              I (Parent) fill it out
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.card, selection === 'self' && styles.cardSelected]}
            onPress={() => setSelection('self')}
          >
            <Text
              style={[
                styles.cardLabel,
                selection === 'self' && styles.cardLabelSelected,
              ]}
            >
              Athlete fills out
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (
      step === 2 &&
      (['U16', 'U18'].includes(form.ageDivision || '') || isLinkFlow)
    ) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.Title}>Self-Link Players</Text>
          <Text style={styles.instructions}>
            Your player is on 16U/18U or a trusted 14U team and should download
            the app to finish setup.
          </Text>
          <Text style={styles.instructions}>
            You can create their account, so all they need to do is login.
          </Text>
          <CustomInput
            label="First Name"
            variant="name"
            fullWidth
            autoCapitalize="words"
            value={form.firstName}
            onChangeText={(v) => setForm({ ...form, firstName: v })}
          />
          <CustomInput
            label="Last Name"
            variant="name"
            autoCapitalize="words"
            fullWidth
            value={form.lastName}
            onChangeText={(v) => setForm({ ...form, lastName: v })}
          />
          <CustomInput
            label="Email"
            variant="email"
            fullWidth
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
          <CustomInput
            label="Password"
            variant="password"
            fullWidth
            secureTextEntry
            description="must be atleast 8 characters"
            value={form.password || ''}
            onChangeText={(v) => setForm({ ...form, password: v })}
          />
          <CustomInput
            label="Confirm Password"
            variant="password"
            fullWidth
            secureTextEntry
            value={form.confirmPass || ''}
            onChangeText={(v) => setForm({ ...form, confirmPass: v })}
          />
        </View>
      );
    }

    if (
      step === 2 &&
      (['U8', 'U10', 'U12'].includes(form.ageDivision || '') ||
        (form.ageDivision === 'U14' && isParentFlow))
    ) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.Title}>Fill Player Info</Text>
          <Text style={styles.instructions}>
            Let's finish setting up your players account
          </Text>
          <CustomInput
            label=" Athlete First Name"
            variant="name"
            fullWidth
            autoCapitalize="words"
            value={form.firstName}
            onChangeText={(v) => setForm({ ...form, firstName: v })}
          />
          <CustomInput
            label="Athlete Last Name"
            variant="name"
            fullWidth
            autoCapitalize="words"
            value={form.lastName}
            onChangeText={(v) => setForm({ ...form, lastName: v })}
          />
          <CustomInput
            label=" Athlete Email"
            variant="email"
            fullWidth
            autoCorrect={false}
            autoCapitalize="none"
            description="optional but recommended"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
          <CustomInput
            label=" Athlete Phone Number"
            variant="default"
            description="optional"
            fullWidth
            keyboardType="number-pad"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
          />
          <DateOfBirthInput
            value={form.dob}
            onChangeText={(v) => setForm({ ...form, dob: v })}
          />
          <CustomInput
            label="Athlete Password"
            variant="password"
            fullWidth
            secureTextEntry
            description="must be atleast 8 characters"
            value={form.password || ''}
            onChangeText={(v) => setForm({ ...form, password: v })}
          />
          <CustomInput
            label=" Athlete Confirm Password"
            variant="password"
            fullWidth
            secureTextEntry
            value={form.confirmPass || ''}
            onChangeText={(v) => setForm({ ...form, confirmPass: v })}
          />
          <Checkbox
            label="Same as Parent/Guardian"
            checked={!!form.sameAsParent}
            onChange={(v) => setForm({ ...form, sameAsParent: v })}
          />
          {!form.sameAsParent && (
            <>
              <CustomInput
                label="Address"
                variant="default"
                fullWidth
                autoCapitalize="words"
                value={form.address}
                onChangeText={(v) => setForm({ ...form, address: v })}
              />
              <CustomSelect
                label="State"
                options={US_STATES}
                defaultValue={form.state}
                onSelect={(v) => setForm({ ...form, state: v })}
              />
              <View style={styles.row}>
                <CustomInput
                  label="City"
                  variant="default"
                  style={styles.half}
                  autoCapitalize="words"
                  value={form.city}
                  onChangeText={(v) => setForm({ ...form, city: v })}
                />
                <CustomInput
                  label="Zip Code"
                  variant="default"
                  style={styles.half}
                  keyboardType="number-pad"
                  value={form.zip}
                  onChangeText={(v) => setForm({ ...form, zip: v })}
                />
              </View>
            </>
          )}
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.stepContainer}>
          <CustomSelect
            label="Primary Position"
            options={POSITIONS}
            defaultValue={form.pos1}
            onSelect={(v) => setForm({ ...form, pos1: v })}
          />
          <CustomSelect
            label="Secondary Position"
            options={POSITIONS}
            defaultValue={form.pos2}
            onSelect={(v) => setForm({ ...form, pos2: v })}
          />
          <CustomInput
            label="Jersey #"
            variant="default"
            fullWidth
            keyboardType="number-pad"
            value={form.jerseyNum}
            onChangeText={(v) => setForm({ ...form, jerseyNum: v })}
          />
          <CustomInput
            label="Graduation Year"
            variant="default"
            fullWidth
            keyboardType="number-pad"
            value={form.gradYear}
            onChangeText={(v) => setForm({ ...form, gradYear: v })}
          />

          <Checkbox
            label="Is this athlete committed to a college?"
            checked={committed}
            onChange={(v) => {
              setCommitted(v);
              setForm({ ...form, committed: v });
            }}
          />

          {committed && (
            <>
              <SchoolInput
                label="College"
                placeholder="Search for a college"
                value={collegeSchool}
                onChange={(school) => {
                  setCollegeSchool(school);
                  const name = school?.name || '';
                  setCollege(name);
                  setForm({ ...form, college: name });
                }}
              />
              <CustomInput
                label="College Committed"
                variant="default"
                fullWidth
                value={college}
                onChangeText={(v) => {
                  setCollege(v);
                  setForm({ ...form, college: v });
                }}
              />
            </>
          )}
        </View>
      );
    }

    if (step === 4) {
      return (
        <View style={styles.stepContainer}>
          <CustomSelect
            label="Jersey Size"
            options={JERSEY_SIZES}
            defaultValue={form.jerseySize ?? undefined}
            onSelect={(v) => setForm({ ...form, jerseySize: v })}
          />
          <CustomSelect
            label="Pant Size"
            options={PANT_SIZES}
            defaultValue={form.pantSize ?? undefined}
            onSelect={(v) => setForm({ ...form, pantSize: v })}
          />
          <CustomSelect
            label="Stirrup Size"
            options={STIRRUP_SIZES}
            defaultValue={form.stirrupSize ?? undefined}
            onSelect={(v) => setForm({ ...form, stirrupSize: v })}
          />
          <CustomSelect
            label="Shorts Size"
            options={SHORTS_SIZES}
            defaultValue={form.shortSize ?? undefined}
            onSelect={(v) => setForm({ ...form, shortSize: v })}
          />
          <CustomSelect
            label="Practice Short Size"
            options={SHORTS_SIZES}
            defaultValue={form.practiceShirtSize ?? undefined}
            onSelect={(v) => setForm({ ...form, practiceShirtSize: v })}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <BackgroundWrapper>
      {/* Hide the native header */}
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {!showSummary ? (
            <ScrollView contentContainerStyle={styles.container}>
              {/* back button inside flow (for steps > 1) */}
              {step > 1 && (
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}

              {renderStep()}

              <CustomButton
                title={step < totalSteps ? 'Continue' : 'Add Player'}
                onPress={handleNext}
                fullWidth
                disabled={!isStepValid()}
              />
            </ScrollView>
          ) : (
            <FlatList
              data={players}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.container}
              ListHeaderComponent={
                <>
                  {/* Back to Profile on the summary screen as well */}
                  <TouchableOpacity
                    style={{ marginBottom: 16 }}
                    onPress={() => router.replace('/profile')}
                  >
                    <Text style={{ fontSize: 16, color: '#fff' }}>
                      ← Back to Profile
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.subTitle}>
                    Players Added: Please double-check your players before
                    submitting.
                  </Text>
                  <Text style={styles.noteText}>
                    (Tap on a player’s card to edit their info, or hit the trash
                    to remove.)
                  </Text>
                </>
              }
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => handleEditPlayer(item, index)}
                  style={styles.playerCard}
                >
                  <View style={styles.playerRow}>
                    <Text style={styles.playerText}>
                      {index + 1}. {item.firstName} {item.lastName} —{' '}
                      {item.teamName} ({item.ageDivision})
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        handleDeletePlayer(index);
                      }}
                    >
                      <Ionicons name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <>
                  <CustomButton
                    variant="secondary"
                    title="Add Another Player"
                    onPress={handleAddAnother}
                    fullWidth
                  />
                  <CustomButton
                    title="Submit All Players"
                    onPress={handleSubmitAll}
                    fullWidth
                  />
                </>
              }
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  stepContainer: { marginBottom: 32 },
  titleStep: {
    fontSize: 20,
    fontWeight: '600',
    color: GlobalColors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  backButton: { marginBottom: 16 },
  backButtonText: {
    color: GlobalColors.bomber,
    fontSize: 16,
    fontWeight: '500',
  },
  Title: {
    fontSize: 24,
    fontWeight: '700',
    color: GlobalColors.white,
    marginBottom: 12,
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  instructions: {
    fontSize: 14,
    color: GlobalColors.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedTeamContainer: {
    backgroundColor: `${GlobalColors.bomber}20`,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  selectedTeamText: {
    color: GlobalColors.white,
    marginTop: 12,
    textAlign: 'center',
  },
  selectedLabel: {
    fontSize: 12,
    color: GlobalColors.white,
    textTransform: 'uppercase',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  cardSelected: {
    borderColor: GlobalColors.bomber,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardLabel: { color: GlobalColors.white, textAlign: 'center' },
  cardLabelSelected: { color: GlobalColors.bomber, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  half: { width: '45%' },
  subTitle: {
    color: GlobalColors.white,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
  playerCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerText: { color: GlobalColors.bomber, fontWeight: '500' },
});
