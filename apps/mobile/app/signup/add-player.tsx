// app/user/components/add-players.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomSelect from '@/components/ui/atoms/dropdown';
import DateOfBirthInput from '@/components/ui/atoms/DOBInput';
import Checkbox from '@/components/ui/atoms/Checkbox';
import CodeInput from '@/components/ui/organisms/TeamCode';
import CustomButton from '@/components/ui/atoms/Button';
import SchoolInput from '@/components/ui/atoms/SchoolInput';

import { useTeamByCode } from '@/hooks/teams/useTeams';
import { useParentSignup } from '@/context/ParentSignupContext';
import { useQueryClient } from '@tanstack/react-query';
import { GlobalColors } from '@/constants/Colors';
import {
  POSITIONS,
  JERSEY_SIZES,
  PANT_SIZES,
  STIRRUP_SIZES,
  SHORTS_SIZES,
} from '@/utils/enumOptions';
import { api } from '@/api/api';
import axios from 'axios';
import type { UserFE } from '@bomber-app/database';
import type { FlatSchool } from '@/utils/SchoolUtil';
import { US_STATES } from '@/utils/state';

type Step =
  | 'START' // NEW: first choice screen
  | 'TEAM'
  | 'CHOICE_14U'
  | 'INFO'
  | 'SPORT'
  | 'GEAR'
  | 'SUMMARY';

type Selection14U = 'parent' | 'self' | null;

type FormState = {
  // team
  teamCode?: string;
  teamName?: string | null;
  ageDivision?: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | string | null;

  // identity
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  password?: string;
  confirmPass?: string;

  // address
  sameAsParent?: boolean;
  address?: string;
  state?: string;
  city?: string;
  zip?: string;

  // sport
  pos1?: string;
  pos2?: string;
  jerseyNum?: string;
  gradYear?: string;
  committed?: boolean;
  college?: string;
  commitId?: string;

  // gear
  jerseySize?: string | null;
  pantSize?: string | null;
  stirrupSize?: string | null;
  shortSize?: string | null;
  practiceShirtSize?: string | null;

  // trust
  isTrusted?: boolean;

  // role
  role?: string;
};

export default function AddPlayersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { role } = useLocalSearchParams<{ role: string }>();

  // parent context (we expect parent flow completed before arriving here)
  const { signupData: parentData } = useParentSignup();

  const [form, setForm] = useState<FormState>({ teamCode: '' });
  const [players, setPlayers] = useState<FormState[]>([]);

  // 14U choice and branch flags
  const [selection, setSelection] = useState<Selection14U>(null);
  const [isLinkFlow, setIsLinkFlow] = useState(false); // 14U self-link OR 16/18
  const [isParentFlow, setIsParentFlow] = useState(false); // 14U parent-filled OR U8/10/12

  // summary + edit
  const [step, setStep] = useState<Step>('START'); // NEW default
  const [showSummary, setShowSummary] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // college search state
  const [committed, setCommitted] = useState(!!form.college);
  const [college, setCollege] = useState(form.college ?? '');
  const [collegeSchool, setCollegeSchool] = useState<FlatSchool | undefined>(
    undefined
  );
  const [commitDate, setCommitDate] = useState<string>('');

  // ------------------------------
  // Helpers
  // ------------------------------

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

  const isTrustedByAge = (age?: string, self14?: boolean) =>
    age === 'U16' || age === 'U18' || !!self14;
  const isUnderage = (age?: string, parent14?: boolean) =>
    age === 'U8' || age === 'U10' || age === 'U12' || !!parent14;

  const nextAfterTeam = (ageDiv?: string | null): Step => {
    if (!ageDiv) return 'TEAM';
    if (ageDiv === 'U14') return 'CHOICE_14U';
    if (ageDiv === 'U16' || ageDiv === 'U18') return 'INFO';
    return 'INFO'; // U8/U10/U12 -> INFO (parent-filled)
  };

  const isLinkFlowOrUpper =
    form.ageDivision === 'U16' || form.ageDivision === 'U18' || isLinkFlow;

  // ------------------------------
  // Team code lookup
  // ------------------------------

  const { data: teamData } = useTeamByCode(form.teamCode || '');

  useEffect(() => {
    if (teamData) {
      setForm((f) => ({
        ...f,
        teamName: teamData.name,
        ageDivision: teamData.ageGroup,
      }));
      setStep((prev) =>
        prev === 'TEAM' ? nextAfterTeam(teamData.ageGroup) : prev
      );
    } else if (step !== 'START') {
      setForm((f) => ({ ...f, teamName: null, ageDivision: null }));
      setStep('TEAM');
    }
  }, [teamData]);

  // ------------------------------
  // Stepper label like index.tsx (INFO → SPORT → GEAR)
  // ------------------------------

  const stepperText = useMemo(() => {
    if (isLinkFlowOrUpper) return undefined;
    if (step === 'INFO') return 'Step 1 of 3';
    if (step === 'SPORT') return 'Step 2 of 3';
    if (step === 'GEAR') return 'Step 3 of 3';
    return undefined;
  }, [step, isLinkFlowOrUpper]);

  // ------------------------------
  // Validation per step
  // ------------------------------

  const canContinue = () => {
    if (step === 'TEAM') return !!form.teamName;

    if (step === 'CHOICE_14U')
      return selection === 'parent' || selection === 'self';

    if (step === 'INFO') {
      const needEmailPass = isLinkFlowOrUpper;
      if (needEmailPass) {
        return (
          !!form.firstName &&
          !!form.lastName &&
          !!form.email &&
          validPass(form.password, form.confirmPass)
        );
      }
      // parent-filled (U8/U10/U12 or 14U-parent)
      return (
        !!form.firstName &&
        !!form.lastName &&
        !!form.dob &&
        validPass(form.password, form.confirmPass)
      );
    }

    if (step === 'SPORT') {
      const base =
        !!form.pos1 && !!form.pos2 && !!form.jerseyNum && !!form.gradYear;
      return committed ? base && !!college : base;
    }

    if (step === 'GEAR') {
      return (
        !!form.jerseySize &&
        !!form.pantSize &&
        !!form.stirrupSize &&
        !!form.shortSize &&
        !!form.practiceShirtSize
      );
    }

    return true;
  };

  // ------------------------------
  // Navigation handlers
  // ------------------------------

  const handleBack = () => {
    if (step === 'INFO') {
      if (form.ageDivision === 'U14') {
        setStep('CHOICE_14U');
        return;
      }
      setStep('TEAM');
      return;
    }
    if (step === 'SPORT') {
      setStep('INFO');
      return;
    }
    if (step === 'GEAR') {
      setStep('SPORT');
      return;
    }
    if (step === 'CHOICE_14U') {
      setSelection(null);
      setIsLinkFlow(false);
      setIsParentFlow(false);
      setStep('TEAM');
      return;
    }
    if (step === 'SUMMARY') {
      setShowSummary(true);
      return;
    }
    if (step === 'TEAM') {
      setStep('START');
      return;
    }
    // START default -> router back/home
    router.replace('/');
  };

  // ------------------------------
  // NEW: Start step actions
  // ------------------------------

  const handleStartCreateNow = () => setStep('TEAM');
  const handleStartLinkLater = () => router.replace('/');

  // ------------------------------
  // Wizard forward
  // ------------------------------

  const goNext = async () => {
    if (!canContinue()) return;

    if (step === 'TEAM') {
      setStep(nextAfterTeam(form.ageDivision || undefined));
      return;
    }

    if (step === 'CHOICE_14U') {
      setIsLinkFlow(selection === 'self');
      setIsParentFlow(selection === 'parent');
      setStep('INFO');
      return;
    }

    if (step === 'INFO') {
      // If self-link (16U/18U or 14U-self), finish right here with sensible defaults
      if (isLinkFlowOrUpper) {
        const self14 = form.ageDivision === 'U14' && isLinkFlow;

        const athlete: FormState = {
          ...form,
          role: 'PLAYER',
          teamCode: form.teamCode || '',
          teamName: form.teamName || '',
          ageDivision: form.ageDivision || '',

          firstName: form.firstName || 'TBD',
          lastName: form.lastName || 'Player',
          email: form.email!,
          phone: form.phone || '0000000000',
          dob: form.dob || '2005-01-01',
          password: form.password!,
          confirmPass: form.confirmPass!,

          address: form.address || '123 Main St',
          city: form.city || 'Anytown',
          state: form.state || 'Texas',
          zip: form.zip || '00000',

          pos1: form.pos1 || 'PITCHER',
          pos2: form.pos2 || 'FIRST_BASE',
          jerseyNum: form.jerseyNum || '0',
          gradYear: form.gradYear || `${new Date().getFullYear()}`,
          committed: form.committed ?? false,
          college: form.college || '',

          jerseySize: form.jerseySize || 'AM',
          pantSize: form.pantSize || 'SIZE_20',
          stirrupSize: form.stirrupSize || 'SM',
          shortSize: form.shortSize || 'ASM',
          practiceShirtSize: form.practiceShirtSize || 'ASM',

          isTrusted: isTrustedByAge(form.ageDivision ?? undefined, self14),
        };

        setPlayers((prev) =>
          editingIndex !== null
            ? prev.map((p, i) => (i === editingIndex ? athlete : p))
            : [...prev, athlete]
        );

        // Reset for next add but keep team context
        setForm({
          teamCode: form.teamCode,
          teamName: form.teamName ?? null,
          ageDivision: form.ageDivision ?? null,
        });
        setSelection(null);
        setIsLinkFlow(false);
        setIsParentFlow(false);
        setEditingIndex(null);
        setCollegeSchool(undefined);
        setStep('SUMMARY');
        setShowSummary(true);
        return;
      }

      // Otherwise proceed to SPORT (parent-filled branch)
      setStep('SPORT');
      return;
    }

    if (step === 'SPORT') {
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
          console.error('[ADD PLAYERS] Commit create error:', err);
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
      setStep('GEAR');
      return;
    }

    if (step === 'GEAR') {
      const self14 = form.ageDivision === 'U14' && isLinkFlow;
      const parent14 = form.ageDivision === 'U14' && isParentFlow;

      const athlete: FormState = {
        ...form,
        isTrusted: isTrustedByAge(form.ageDivision ?? undefined, self14),
        ...(isUnderage(form.ageDivision ?? undefined, parent14) && {
          email:
            form.email ||
            `${form.teamCode?.toLowerCase()}+${Math.random()
              .toString(36)
              .slice(2, 6)}@bomber.app`,
          phone: form.phone || '1111111111',
        }),
      };

      setPlayers((prev) =>
        editingIndex !== null
          ? prev.map((p, i) => (i === editingIndex ? athlete : p))
          : [...prev, athlete]
      );

      // Reset for next add but keep team context
      setForm({
        teamCode: form.teamCode,
        teamName: form.teamName ?? null,
        ageDivision: form.ageDivision ?? null,
      });
      setSelection(null);
      setIsLinkFlow(false);
      setIsParentFlow(false);
      setEditingIndex(null);
      setCollegeSchool(undefined);
      setStep('SUMMARY');
      setShowSummary(true);
      return;
    }
  };

  // ------------------------------
  // SUMMARY actions you asked about
  // ------------------------------

  const handleAddAnother = () => {
    setShowSummary(false);
    setStep(nextAfterTeam(form.ageDivision));
  };

  const handleDeletePlayer = (idx: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEditPlayer = (ath: FormState, idx: number) => {
    setForm({ ...ath });
    setShowSummary(false);

    const { ageDivision, isTrusted } = ath;
    if (
      isTrusted ||
      ageDivision === 'U14' ||
      ageDivision === 'U16' ||
      ageDivision === 'U18'
    ) {
      // treat as link flow for 14/16/18 where appropriate
      setIsLinkFlow(
        isTrusted || ageDivision === 'U16' || ageDivision === 'U18'
      );
      setIsParentFlow(
        !(isTrusted || ageDivision === 'U16' || ageDivision === 'U18')
      );
    } else {
      setIsLinkFlow(false);
      setIsParentFlow(true);
    }

    setSelection(null);
    setEditingIndex(idx);
    setStep('INFO');
  };

  const handleSubmitAll = async () => {
    try {
      const parentId = parentData.parentId;
      const parentAddrId = parentData.addressID;
      if (!parentId)
        throw new Error('Parent ID missing – complete Parent signup first.');

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
          password: ath.password ?? ath.confirmPass, // password already validated
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
            pantSize: ath.pantSize || 'AM',
            stirrupSize: ath.stirrupSize || 'AS',
            shortSize: ath.shortSize || 'AS',
            practiceShortSize: ath.practiceShirtSize || 'AS',
            isTrusted: ath.isTrusted,
            college: ath.college,
            ...(ath.commitId
              ? { commit: { connect: { id: ath.commitId } } }
              : {}),

            // team link by teamCode
            team: { connect: { teamCode: ath.teamCode! } },
            // link back to Parent
            parents: { connect: { id: parentId } },
            // address connect (optional)
            ...(athleteAddrId
              ? { address: { connect: { id: athleteAddrId } } }
              : {}),
          },
        } as const;

        try {
          await api.post('/api/auth/signup', playerPayload);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            console.error('[ADD PLAYERS] Signup flow error:');
            console.error('  URL:', err.config?.url);
            console.error('  Method:', err.config?.method);
            console.error('  Payload:', err.config?.data);
            console.error('  Status:', err.response?.status);
            console.error('  Status Text:', err.response?.statusText);
            console.error('  Response Data:', err.response?.data);
          } else {
            console.error('[ADD PLAYERS] Unexpected error:', err);
          }
        }
      }

      const { data: me } = await api.get<UserFE>('/api/auth/me');
      queryClient.setQueryData(['currentUser'], me);
      router.replace('/');
    } catch (err) {
      console.error('[ADD PLAYERS] Submit all error:', err);
    }
  };

  // ------------------------------
  // Render blocks
  // ------------------------------

  const renderStart = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.Title}>Add a Player to Your Account</Text>
      <Text style={styles.instructions}>Choose one of the options below:</Text>

      <Text style={styles.instructions}>You have two options:</Text>

      <Text style={styles.instructions}>
        •{' '}
        <Text style={{ fontWeight: 'bold' }}>
          Create a new player profile now
        </Text>{' '}
        – for players not already in the app.
      </Text>

      <Text style={styles.instructions}>
        • <Text style={{ fontWeight: 'bold' }}>Skip for now</Text> – you can
        still add players later from inside the app, either by
        <Text style={{ fontWeight: 'bold' }}> creating a new profile</Text> or
        <Text style={{ fontWeight: 'bold' }}> linking an existing one</Text>.
      </Text>

      <Text style={styles.instructions}>
        To add later: App Settings → Players
      </Text>

      <CustomButton
        title="Create a New Player Now"
        onPress={handleStartCreateNow}
        fullWidth
      />

      <View style={{ height: 12 }} />

      <CustomButton
        variant="secondary"
        title="I’ll Add a Player Later"
        onPress={handleStartLinkLater}
        fullWidth
      />
    </View>
  );

  const renderTeam = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.titleStep}>Step 1: Enter Team Code</Text>
      <Text style={styles.Title}>Lets Start and Link your Bomber Players</Text>
      <Text style={styles.instructions}>
        Start by entering the 5-character code you received in your Bomber
        Welcome email for your player.
      </Text>
      <Text style={styles.instructions}>
        Bomber codes are unique make sure the team code matches for your players
        team.
      </Text>
      <CodeInput
        length={5}
        onChange={(code) => {
          const up = code.toUpperCase();
          setForm((f) => ({ ...f, teamCode: up }));
        }}
      />
      {!!form.teamName && (
        <View style={styles.selectedTeamContainer}>
          <Text style={styles.selectedLabel}>Team:</Text>
          <Text style={styles.selectedTeamText}>
            {form.teamName} ({form.ageDivision})
          </Text>
        </View>
      )}
    </View>
  );

  const renderChoice14U = () => (
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

  const renderInfo = () => (
    <View style={styles.stepContainer}>
      {stepperText && <Text style={styles.stepperText}>{stepperText}</Text>}

      {isLinkFlowOrUpper ? (
        <>
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
            autoCapitalize="words"
            fullWidth
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
            autoCorrect={false}
            autoCapitalize="none"
            fullWidth
            keyboardType="email-address"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
          <CustomInput
            label="Password"
            variant="password"
            description="Must be atleast 8 Characters"
            fullWidth
            secureTextEntry
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
        </>
      ) : (
        <>
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
            label=" Athlete Email (Optional)"
            variant="email"
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="email-address"
            fullWidth
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
          <CustomInput
            label=" Athlete Phone Number (Optional)"
            variant="default"
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
            description="Must be atleast 8 Characters"
            fullWidth
            secureTextEntry
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
                autoCapitalize="words"
                fullWidth
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
                  autoCapitalize="words"
                  style={styles.half}
                  value={form.city}
                  onChangeText={(v) => setForm({ ...form, city: v })}
                />
                <CustomInput
                  label="Zip Code"
                  variant="default"
                  style={styles.half}
                  value={form.zip}
                  onChangeText={(v) => setForm({ ...form, zip: v })}
                />
              </View>
            </>
          )}
        </>
      )}
    </View>
  );

  const renderSport = () => (
    <View style={styles.stepContainer}>
      {stepperText && <Text style={styles.stepperText}>{stepperText}</Text>}

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

  const renderGear = () => (
    <View style={styles.stepContainer}>
      {stepperText && <Text style={styles.stepperText}>{stepperText}</Text>}

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
        label="Practice Shirt Size"
        options={SHORTS_SIZES}
        defaultValue={form.practiceShirtSize ?? undefined}
        onSelect={(v) => setForm({ ...form, practiceShirtSize: v })}
      />
    </View>
  );

  const renderSummary = () => (
    <FlatList
      data={players}
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          <Text style={styles.subTitle}>
            Players Added: Please double-check your players before submitting.
          </Text>
          <Text style={styles.noteText}>
            (Tap on a player’s card to edit their info, or hit the trash to
            remove.)
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
              {index + 1}. {item.firstName} {item.lastName} — {item.teamName} (
              {item.ageDivision})
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
  );

  // ------------------------------
  // Main render
  // ------------------------------

  const showPrimaryButton = step !== 'SUMMARY' && step !== 'START';
  const primaryTitle =
    step === 'GEAR' ? 'Add Player' : step === 'TEAM' ? 'Continue' : 'Continue';

  const renderBody = () => {
    if (step === 'START') return renderStart();
    if (step === 'TEAM') return renderTeam();
    if (step === 'CHOICE_14U') return renderChoice14U();
    if (step === 'INFO') return renderInfo();
    if (step === 'SPORT') return renderSport();
    if (step === 'GEAR') return renderGear();
    if (step === 'SUMMARY') return renderSummary();
    return null;
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {step !== 'SUMMARY' ? (
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              {/* back button */}
              {step !== 'START' && (
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}

              {renderBody()}

              {showPrimaryButton && (
                <CustomButton
                  title={primaryTitle}
                  onPress={goNext}
                  fullWidth
                  disabled={!canContinue()}
                />
              )}
            </ScrollView>
          ) : (
            renderSummary()
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
  stepperText: {
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 8,
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
