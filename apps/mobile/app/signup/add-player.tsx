// AddPlayersScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
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
import { GlobalColors } from '@/constants/Colors';
import {
  POSITIONS,
  JERSEY_SIZES,
  PANT_SIZES,
  STIRRUP_SIZES,
  SHORTS_SIZES,
} from '@/utils/enumOptions';

type Team = {
  teamCode: string;
  teamName: string;
  ageDivision: '12U' | '14U' | '18U';
};

const DUMMY_TEAMS: Record<string, Team> = {
  '12431': {
    teamCode: '12431',
    teamName: 'Texas Bombers Gold',
    ageDivision: '12U',
  },
  '12345': {
    teamCode: '12345',
    teamName: 'Lone Star Bombers',
    ageDivision: '14U',
  },
  '67890': { teamCode: '67890', teamName: 'Austin Aces', ageDivision: '18U' },
};

type Player = {
  teamCode: string;
  teamName: string | null;
  ageDivision: '12U' | '14U' | '18U' | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  sameAsParent: boolean;
  address: string;
  state: string;
  city: string;
  zip: string;
  position1: string | null;
  position2: string | null;
  jerseyNum: string;
  gradYear: string;
  committed: boolean;
  college: string;
  jerseySize: string | null;
  pantSize: string | null;
  stirrupSize: string | null;
  shortSize: string | null;
  practiceShirtSize: string | null;
  password?: string;
};

const initialForm: Player = {
  teamCode: '',
  teamName: null,
  ageDivision: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  sameAsParent: false,
  address: '',
  state: '',
  city: '',
  zip: '',
  position1: null,
  position2: null,
  jerseyNum: '',
  gradYear: '',
  committed: false,
  college: '',
  jerseySize: null,
  pantSize: null,
  stirrupSize: null,
  shortSize: null,
  practiceShirtSize: null,
  password: '',
};

export default function AddPlayersScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState<Player>({ ...initialForm });
  const [showSummary, setShowSummary] = useState(false);
  const [selection, setSelection] = useState<'parent' | 'self' | null>(null);
  const [isLinkFlow, setIsLinkFlow] = useState(false);
  const [isParentFlow, setIsParentFlow] = useState(false);

  const totalSteps = React.useMemo(() => {
    if (form.ageDivision === '18U') return 2;
    if (form.ageDivision === '14U' && isLinkFlow) return 2;
    return 4;
  }, [form.ageDivision, isLinkFlow]);

  useEffect(() => {
    const code = form.teamCode.trim().toUpperCase();
    if (code.length === 5) {
      Keyboard.dismiss();
      const team = DUMMY_TEAMS[code];
      setForm((f) => ({
        ...f,
        teamCode: code,
        teamName: team?.teamName ?? null,
        ageDivision: team?.ageDivision ?? null,
      }));
    } else {
      setForm((f) => ({ ...f, teamName: null, ageDivision: null }));
    }
  }, [form.teamCode]);

  const isStepValid = () => {
    if (step === 1) {
      return !!form.teamName;
    }
    // personal-info for 12U or after Parent-choice on 14U
    if (
      step === 2 &&
      (form.ageDivision === '12U' ||
        (form.ageDivision === '14U' && isParentFlow))
    ) {
      return (
        !!form.firstName &&
        !!form.lastName &&
        !!form.email &&
        !!form.phone &&
        !!form.dob
      );
    }
    // choice cards on 14U
    if (
      step === 2 &&
      form.ageDivision === '14U' &&
      !isLinkFlow &&
      !isParentFlow
    ) {
      return selection !== null;
    }
    // link flow (18U or after Athlete-choice)
    if (step === 2 && (form.ageDivision === '18U' || isLinkFlow)) {
      return !!form.email && !!form.password;
    }
    if (step === 3) {
      const base =
        form.position1 && form.position2 && form.jerseyNum && form.gradYear;
      return form.committed ? !!base && !!form.college : !!base;
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

  const handleNext = () => {
    if (!isStepValid()) return;

    // first Continue after Athlete-choice on 14U
    if (
      step === 2 &&
      form.ageDivision === '14U' &&
      selection === 'self' &&
      !isLinkFlow
    ) {
      setIsLinkFlow(true);
      return;
    }
    // first Continue after Parent-choice on 14U
    if (
      step === 2 &&
      form.ageDivision === '14U' &&
      selection === 'parent' &&
      !isParentFlow
    ) {
      setIsParentFlow(true);
      return;
    }
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      setPlayers((p) => [...p, form]);
      setShowSummary(true);
    }
  };

  const handleAddAnother = () => {
    setForm({
      ...initialForm,
      teamCode: form.teamCode,
      teamName: form.teamName,
      ageDivision: form.ageDivision,
    });
    setSelection(null);
    setIsLinkFlow(false);
    setIsParentFlow(false);
    setShowSummary(false);
    setStep(1);
  };

  const handleAddNew = () => {
    setForm({ ...initialForm });
    setSelection(null);
    setIsLinkFlow(false);
    setIsParentFlow(false);
    setShowSummary(false);
    setStep(1);
  };

  const handleFinish = () => {
    router.back();
  };

  const renderStep = () => {
    // STEP 1: Team code
    if (step === 1) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.titleStep}>Step 1 of {totalSteps}</Text>
          <Text style={styles.instructions}>
            Enter the 5-character code you received in your Bomber Welcome
            email.
          </Text>
          <View style={styles.codeWrapper}>
            <CodeInput
              length={5}
              onChange={(code) =>
                setForm((f) => ({ ...f, teamCode: code.toUpperCase() }))
              }
            />
          </View>
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

    // STEP 2: Personal-info for 12U or 14U-parent
    if (
      step === 2 &&
      (form.ageDivision === '12U' ||
        (form.ageDivision === '14U' && isParentFlow))
    ) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.titleStep}>Step 2 of {totalSteps}</Text>
          <Text style={styles.instructions}>
            Fill in the athlete’s personal info.
          </Text>
          <CustomInput
            label="First Name"
            variant="name"
            fullWidth
            value={form.firstName}
            onChangeText={(t) => setForm((f) => ({ ...f, firstName: t }))}
          />
          <CustomInput
            label="Last Name"
            variant="name"
            fullWidth
            value={form.lastName}
            onChangeText={(t) => setForm((f) => ({ ...f, lastName: t }))}
          />
          <CustomInput
            label="Email"
            variant="email"
            fullWidth
            value={form.email}
            onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
          />
          <CustomInput
            label="Phone Number"
            variant="default"
            keyboardType="number-pad"
            fullWidth
            value={form.phone}
            onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
          />
          <DateOfBirthInput
            onChangeText={(t) => setForm((f) => ({ ...f, dob: t }))}
          />
          <Checkbox
            label="Same as Parent/Guardian"
            checked={form.sameAsParent}
            onChange={(v) => setForm((f) => ({ ...f, sameAsParent: v }))}
          />
          {!form.sameAsParent && (
            <>
              <CustomInput
                label="Address"
                variant="default"
                fullWidth
                value={form.address}
                onChangeText={(t) => setForm((f) => ({ ...f, address: t }))}
              />
              <CustomInput
                label="State"
                variant="default"
                fullWidth
                value={form.state}
                onChangeText={(t) => setForm((f) => ({ ...f, state: t }))}
              />
              <View style={styles.row}>
                <CustomInput
                  label="City"
                  variant="default"
                  style={styles.half}
                  value={form.city}
                  onChangeText={(t) => setForm((f) => ({ ...f, city: t }))}
                />
                <CustomInput
                  label="Zip Code"
                  variant="default"
                  style={styles.half}
                  value={form.zip}
                  onChangeText={(t) => setForm((f) => ({ ...f, zip: t }))}
                />
              </View>
            </>
          )}
        </View>
      );
    }

    // STEP 2: Choice cards for 14U
    if (
      step === 2 &&
      form.ageDivision === '14U' &&
      !isLinkFlow &&
      !isParentFlow
    ) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.subTitle}>
            Your athlete has been placed on a 14U team. Because of the age
            division we will allow the Parent to decide.
          </Text>
          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[
                styles.card,
                selection === 'parent' && styles.cardSelected,
              ]}
              onPress={() => setSelection('parent')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.cardLabel,
                  selection === 'parent' && styles.cardLabelSelected,
                ]}
              >
                Have Parent fill out Player Info
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.card, selection === 'self' && styles.cardSelected]}
              onPress={() => setSelection('self')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.cardLabel,
                  selection === 'self' && styles.cardLabelSelected,
                ]}
              >
                Have Athlete fill out their own info
              </Text>
            </TouchableOpacity>
          </View>
          {selection && (
            <Text style={styles.line2}>
              {selection === 'parent'
                ? 'As your athlete is under 14, we’ll collect their details through your parent account. We recommend they download the app to stay connected.'
                : 'Your athlete will enter their own info—perfect for older players who can handle it themselves.'}
            </Text>
          )}
        </View>
      );
    }

    // STEP 2: Email/password for 18U or 14U-self
    if (step === 2 && (form.ageDivision === '18U' || isLinkFlow)) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.titleStep}>Step 2 of {totalSteps}</Text>
          <Text style={styles.instructions}>
            Get your Athlete Setup here. Once setup, they’ll need to download
            the app and use this login to finish Bomber registration.
          </Text>
          <CustomInput
            label="Email"
            variant="email"
            fullWidth
            value={form.email}
            onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
          />
          <CustomInput
            label="Password"
            variant="password"
            fullWidth
            value={form.password || ''}
            onChangeText={(t) => setForm((f) => ({ ...f, password: t }))}
          />
        </View>
      );
    }

    // STEP 3: Sport & jersey
    if (step === 3) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.titleStep}>Step 3 of {totalSteps}</Text>
          <Text style={styles.instructions}>
            Provide sport & jersey details.
          </Text>
          <CustomSelect
            label="Primary Position"
            options={POSITIONS}
            defaultValue={form.position1 || undefined}
            onSelect={(v) => setForm((f) => ({ ...f, position1: v }))}
          />
          <CustomSelect
            label="Secondary Position"
            options={POSITIONS}
            defaultValue={form.position2 || undefined}
            onSelect={(v) => setForm((f) => ({ ...f, position2: v }))}
          />
          <CustomInput
            label="Jersey #"
            variant="default"
            fullWidth
            value={form.jerseyNum}
            onChangeText={(t) => setForm((f) => ({ ...f, jerseyNum: t }))}
          />
          <CustomInput
            label="Graduation Year"
            variant="default"
            fullWidth
            keyboardType="number-pad"
            value={form.gradYear}
            onChangeText={(t) => setForm((f) => ({ ...f, gradYear: t }))}
          />
          <Checkbox
            label="Committed to College"
            checked={form.committed}
            onChange={(v) => setForm((f) => ({ ...f, committed: v }))}
          />
          {form.committed && (
            <CustomInput
              label="College"
              variant="default"
              fullWidth
              value={form.college}
              onChangeText={(t) => setForm((f) => ({ ...f, college: t }))}
            />
          )}
        </View>
      );
    }

    // STEP 4: Gear sizes
    if (step === 4) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.titleStep}>Step 4 of {totalSteps}</Text>
          <Text style={styles.instructions}>Finally, select gear sizes.</Text>
          <CustomSelect
            label="Jersey Top Size"
            options={JERSEY_SIZES}
            defaultValue={form.jerseySize || undefined}
            onSelect={(v) => setForm((f) => ({ ...f, jerseySize: v }))}
          />
          <CustomSelect
            label="Pant Size"
            options={PANT_SIZES}
            defaultValue={form.pantSize || undefined}
            onSelect={(v) => setForm((f) => ({ ...f, pantSize: v }))}
          />
          <CustomSelect
            label="Stirrup Size"
            options={STIRRUP_SIZES}
            defaultValue={form.stirrupSize || undefined}
            onSelect={(v) => setForm((f) => ({ ...f, stirrupSize: v }))}
          />
          <CustomSelect
            label="Shorts Size"
            options={SHORTS_SIZES}
            defaultValue={form.shortSize || undefined}
            onSelect={(v) => setForm((f) => ({ ...f, shortSize: v }))}
          />
          <CustomSelect
            label="Practice Shirt Size"
            options={JERSEY_SIZES}
            defaultValue={form.practiceShirtSize || undefined}
            onSelect={(v) => setForm((f) => ({ ...f, practiceShirtSize: v }))}
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
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
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
              contentContainerStyle={styles.container}
              data={players}
              keyExtractor={(_, i) => i.toString()}
              ListHeaderComponent={
                <Text style={styles.subTitle}>Players Added:</Text>
              }
              renderItem={({ item, index }) => (
                <View style={styles.playerCard}>
                  <Text style={styles.playerText}>
                    {index + 1}.{' '}
                    {item.firstName || item.lastName
                      ? `${item.firstName} ${item.lastName}`.trim()
                      : 'Unnamed Player'}
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
                    variant="secondary"
                    title="Add New Player"
                    onPress={handleAddNew}
                    fullWidth
                  />
                  <CustomButton
                    title="Finish"
                    onPress={handleFinish}
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
  stepContainer: { marginBottom: 20, alignItems: 'center' },
  titleStep: {
    fontSize: 20,
    fontWeight: '600',
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  codeWrapper: { alignItems: 'center', marginBottom: 12 },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GlobalColors.white,
    marginBottom: 32,
    textAlign: 'center',
  },
  choiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardSelected: {
    borderColor: GlobalColors.bomber,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardLabel: {
    color: GlobalColors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: GlobalColors.bomber,
    fontWeight: '600',
  },
  line2: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  selectedTeamContainer: {
    backgroundColor: `${GlobalColors.bomber}20`,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 12,
    color: GlobalColors.white,
    textTransform: 'uppercase',
  },
  selectedTeamText: {
    fontSize: 18,
    fontWeight: '600',
    color: GlobalColors.white,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  half: { width: '48%' },
  playerCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerText: {
    fontSize: 16,
    fontWeight: '500',
    color: GlobalColors.bomber,
  },
});
