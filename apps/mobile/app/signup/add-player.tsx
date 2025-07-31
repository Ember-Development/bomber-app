// app/signup/add-players.tsx

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
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomSelect from '@/components/ui/atoms/dropdown';
import DateOfBirthInput from '@/components/ui/atoms/DOBInput';
import Checkbox from '@/components/ui/atoms/Checkbox';
import CodeInput from '@/components/ui/organisms/TeamCode';
import CustomButton from '@/components/ui/atoms/Button';
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
import { TeamFE } from '@bomber-app/database';
import { api } from '@/api/api';

export default function AddPlayersScreen() {
  const router = useRouter();
  const { signupData, setSignupData } = usePlayerSignup();
  const { signupData: parentData } = useParentSignup();

  // Single‐player form state, and list of all added players
  const [form, setForm] = useState({ teamCode: '' } as any);
  const [players, setPlayers] = useState<any[]>([]);

  // Navigation & flow state
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<'parent' | 'self' | null>(null);
  const [isLinkFlow, setIsLinkFlow] = useState(false);
  const [isParentFlow, setIsParentFlow] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Fetch real team details
  const { data: teamData } = useTeamByCode(form.teamCode);
  useEffect(() => {
    if (teamData) {
      setForm((f: TeamFE) => ({
        ...f,
        teamName: teamData.name,
        ageDivision: teamData.ageGroup,
      }));
    } else {
      setForm((f: TeamFE) => ({
        ...f,
        teamName: null,
        ageDivision: null,
      }));
    }
  }, [teamData]);

  // Decide how many steps this player needs
  const totalSteps = useMemo(() => {
    if (['U16', 'U18'].includes(form.ageDivision || '')) return 2;
    if (form.ageDivision === 'U14' && isLinkFlow) return 2;
    return 4;
  }, [form.ageDivision, isLinkFlow]);

  // Validation at each step
  const isStepValid = () => {
    if (step === 1) {
      return !!form.teamName;
    }
    // 12U or 14U+parent: personal info
    if (
      step === 2 &&
      (form.ageDivision === 'U12' ||
        (form.ageDivision === 'U14' && isParentFlow))
    ) {
      return (
        !!form.firstName &&
        !!form.lastName &&
        !!form.dob &&
        !!form.pass &&
        !!form.confirmPass &&
        form.pass === form.confirmPass
      );
    }
    // 14U choice cards
    if (
      step === 2 &&
      form.ageDivision === 'U14' &&
      !isLinkFlow &&
      !isParentFlow
    ) {
      return selection !== null;
    }
    // U16/U18 or 14U-self: email/password + confirm
    if (
      step === 2 &&
      (['U16', 'U18'].includes(form.ageDivision || '') || isLinkFlow)
    ) {
      return (
        !!form.email &&
        !!form.password &&
        !!form.confirmPass &&
        form.password === form.confirmPass
      );
    }
    // sport & jersey info
    if (step === 3) {
      const base = form.pos1 && form.pos2 && form.jerseyNum && form.gradYear;
      return form.committed ? !!base && !!form.college : !!base;
    }
    // gear sizes
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

  // Move to next step, or finish this player
  const handleNext = () => {
    if (!isStepValid()) return;

    // 14U → athlete/self branching
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

    // Advance or finalize this player
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      const isUnderage = ['U8', 'U10', 'U12', 'U14'].includes(
        form.ageDivision || ''
      );
      const isAdultLink = ['U16', 'U18'].includes(form.ageDivision || '');
      const istrusted =
        ['U16', 'U18'].includes(form.ageDivision || '') ||
        (form.ageDivision === 'U14' && isLinkFlow);

      // build final payload
      const athlete = isUnderage
        ? {
            ...form,
            email:
              form.email ||
              `${form.teamCode.toLowerCase()}+${Math.random()
                .toString(36)
                .substring(2, 6)}@bomber.app`,
            phone: form.phone || '0000000000',
            isTrusted: false,
          }
        : isAdultLink
          ? {
              ...form,
              // every field your backend needs, with sensible defaults
              role: form.role || 'PLAYER',
              teamCode: form.teamCode || '',
              teamName: form.teamName || '',
              ageDivision: form.ageDivision || '',

              firstName: form.firstName || 'TBD',
              lastName: form.lastName || 'Player',
              email:
                form.email ||
                `${form.teamCode.toLowerCase()}+${Math.random()
                  .toString(36)
                  .substring(2, 6)}@bomber.app`,
              phone: form.phone || '0000000000',
              dob: form.dob || '2005-01-01',
              pass: form.pass || 'TempPass123!',
              confirmPass: form.confirmPass || 'TempPass123!',
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
              ageGroup: form.ageGroup || '',

              jerseySize: form.jerseySize || 'AM',
              pantSize: form.pantSize || 'SIZE_20',
              stirrupSize: form.stirrupSize || 'SM',
              shortSize: form.shortSize || 'ASM',
              practiceShirtSize: form.practiceShirtSize || 'ASM',
              isTrusted: istrusted,

              players: form.players || [],
            }
          : form;

      console.log('Adding athlete info:', athlete);
      setPlayers((p) => [...p, athlete]);
      // reset form state for next player
      setForm({ teamCode: form.teamCode });
      setSelection(null);
      setIsLinkFlow(false);
      setIsParentFlow(false);
      setStep(1);
      setShowSummary(true);
    }
  };

  // If adding more players
  const handleAddAnother = () => {
    setShowSummary(false);
  };

  // If done adding, push into context and move on
  const handleSubmitAll = async () => {
    try {
      // 0) Grab the parentId and parent addressID from context
      const parentId = parentData.parentId;
      const parentAddrId = parentData.addressID;
      if (!parentId) {
        throw new Error(
          'Parent ID missing – make sure you completed the Parent signup first'
        );
      }

      // 1) Loop through each athlete and create/link their address
      for (const ath of players) {
        let athleteAddrId: string | undefined;

        // If athlete opted to reuse parent address, use that
        if (ath.sameAsParent && parentAddrId) {
          athleteAddrId = parentAddrId;
        }
        // Otherwise, if athlete provided their own address, create it first
        else if (ath.address && ath.city && ath.state && ath.zip) {
          const { data: newAddr } = await api.post('/api/users/address', {
            address1: ath.address,
            city: ath.city,
            state: ath.state,
            zip: ath.zip,
          });
          athleteAddrId = newAddr.id;
        }

        // 2) Build the Player signup payload, connecting to Team, Parent, and Address
        const playerPayload = {
          email: ath.email,
          password: ath.pass,
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
            jerseySize: ath.jerseySize || 'M',
            pantSize: ath.pantSize || 'SIZE_32',
            stirrupSize: ath.stirrupSize || 'SM',
            shortSize: ath.shortSize || 'AS',
            practiceShortSize: ath.practiceShirtSize || 'AS',
            isTrusted: ath.isTrusted,

            // link to the Team
            team: { connect: { teamCode: ath.teamCode! } },
            // link back to the Parent
            parents: { connect: { id: parentId } },

            // link or create the athlete’s Address
            ...(athleteAddrId
              ? { address: { connect: { id: athleteAddrId } } }
              : {}),
          },
        };

        // 3) Sign up the Player
        await api.post('/api/auth/signup', playerPayload);
      }

      // 4) All done — navigate to confirmation
      router.replace('/');
    } catch (err: any) {
      console.error('[ADD PLAYERS] Signup flow error:', err);
      // TODO: surface a user‐friendly error message/toast here
    }
  };

  // Render each step’s UI
  const renderStep = () => {
    // STEP 1: Team code
    if (step === 1) {
      return (
        <View style={styles.stepContainer}>
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
              setForm((f: any) => ({ ...f, teamCode: up }));
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

    // STEP 2: choice or personal info / login
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

    // STEP 2: email/password for 18U or 14U-self
    if (step === 2 && (form.ageDivision === 'U18' || isLinkFlow)) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.Title}>Self-Link Players</Text>
          <Text style={styles.instructions}>
            Your player is on 16U/18U and should download the app to finish
            setup.
          </Text>
          <Text style={styles.instructions}>
            You can create their account, so all they need to do is login.
          </Text>
          <CustomInput
            label="Email"
            variant="email"
            fullWidth
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
          <CustomInput
            label="Password"
            variant="password"
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
        </View>
      );
    }

    // STEP 2: personal info for 12U or 14U+parent
    if (
      step === 2 &&
      (form.ageDivision === 'U12' ||
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
            value={form.firstName}
            onChangeText={(v) => setForm({ ...form, firstName: v })}
          />
          <CustomInput
            label="Athlete Last Name"
            variant="name"
            fullWidth
            value={form.lastName}
            onChangeText={(v) => setForm({ ...form, lastName: v })}
          />
          <CustomInput
            label=" Athlete Email (Optional)"
            variant="email"
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
            fullWidth
            secureTextEntry
            value={form.pass || ''}
            onChangeText={(v) => setForm({ ...form, pass: v })}
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
                value={form.address}
                onChangeText={(v) => setForm({ ...form, address: v })}
              />
              <CustomInput
                label="State"
                variant="default"
                fullWidth
                value={form.state}
                onChangeText={(v) => setForm({ ...form, state: v })}
              />
              <View style={styles.row}>
                <CustomInput
                  label="City"
                  variant="default"
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
        </View>
      );
    }

    // STEP 3: sport & jersey
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
            label="Committed to College"
            checked={!!form.committed}
            onChange={(v) => setForm({ ...form, committed: v })}
          />
          {form.committed && (
            <CustomInput
              label="College"
              variant="default"
              fullWidth
              value={form.college}
              onChangeText={(v) => setForm({ ...form, college: v })}
            />
          )}
        </View>
      );
    }

    // STEP 4: gear sizes
    if (step === 4) {
      return (
        <View style={styles.stepContainer}>
          <CustomSelect
            label="Jersey Size"
            options={JERSEY_SIZES}
            defaultValue={form.jerseySize}
            onSelect={(v) => setForm({ ...form, jerseySize: v })}
          />
          <CustomSelect
            label="Pant Size"
            options={PANT_SIZES}
            defaultValue={form.pantSize}
            onSelect={(v) => setForm({ ...form, pantSize: v })}
          />
          <CustomSelect
            label="Stirrup Size"
            options={STIRRUP_SIZES}
            defaultValue={form.stirrupSize}
            onSelect={(v) => setForm({ ...form, stirrupSize: v })}
          />
          <CustomSelect
            label="Shorts Size"
            options={SHORTS_SIZES}
            defaultValue={form.shortSize}
            onSelect={(v) => setForm({ ...form, shortSize: v })}
          />
          <CustomSelect
            label="Practice Short Size"
            options={SHORTS_SIZES}
            defaultValue={form.practiceShirtSize}
            onSelect={(v) => setForm({ ...form, practiceShirtSize: v })}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {!showSummary ? (
            <ScrollView contentContainerStyle={styles.container}>
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
                <Text style={styles.subTitle}>Players Added</Text>
              }
              renderItem={({ item, index }) => (
                <View style={styles.playerCard}>
                  <Text style={styles.playerText}>
                    {index + 1}. {item.firstName} {item.lastName}
                  </Text>
                </View>
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
  cardLabel: {
    color: GlobalColors.white,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: GlobalColors.bomber,
    fontWeight: '600',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  half: { width: '45%' },
  subTitle: {
    color: GlobalColors.white,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  playerCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerText: {
    color: GlobalColors.bomber,
    fontWeight: '500',
  },
});
