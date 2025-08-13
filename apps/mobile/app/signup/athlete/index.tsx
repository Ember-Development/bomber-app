import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomSelect from '@/components/ui/atoms/dropdown';
import CustomButton from '@/components/ui/atoms/Button';
import DateOfBirthInput from '@/components/ui/atoms/DOBInput';
import Checkbox from '@/components/ui/atoms/Checkbox';
import SchoolInput from '@/components/ui/atoms/SchoolInput';

import { usePlayerSignup } from '@/context/PlayerSignupContext';
import { US_STATES } from '@/utils/state';
import {
  POSITIONS,
  JERSEY_SIZES,
  PANT_SIZES,
  STIRRUP_SIZES,
  SHORTS_SIZES,
  POSITIONS_DROPDOWN,
} from '@/utils/enumOptions';
import { GlobalColors } from '@/constants/Colors';
import { api } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import type { FlatSchool } from '@/utils/SchoolUtil';

type Step = 'RESTRICTIONS' | 'INFO' | 'SPORT' | 'GEAR';

export default function AthleteStepper() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    ageDivision?: string;
    teamCode?: string;
    role?: string;
    teamName?: string;
  }>();

  const ageDivision = (params.ageDivision ?? '').toUpperCase();
  const { signupData, setSignupData, updateSignupData, resetSignupData } =
    usePlayerSignup();

  useEffect(() => {
    updateSignupData({
      teamCode: params.teamCode ?? signupData.teamCode,
      teamName: params.teamName ?? signupData.teamName,
      ageDivision: ageDivision || signupData.ageDivision,
    });
  }, []);

  // starting step
  const startingStep: Step = useMemo(() => {
    if (ageDivision === 'U18' || ageDivision === 'U16') return 'INFO';
    // younger divisions go to restrictions
    return 'RESTRICTIONS';
  }, [ageDivision]);

  const [step, setStep] = useState<Step>(startingStep);

  // -----------------------
  // INFO
  const [athleteFirst, setAthleteFirst] = useState(signupData.firstName ?? '');
  const [athleteLast, setAthleteLast] = useState(signupData.lastName ?? '');
  const [athleteEmail, setAthleteEmail] = useState(signupData.email ?? '');
  const [athletePhone, setAthletePhone] = useState(signupData.phone ?? '');
  const [dob, setDob] = useState(signupData.dob ?? '');
  const [password, setPassword] = useState(signupData.pass ?? '');
  const [confirmPassword, setConfirmPassword] = useState(
    signupData.confirmPass ?? ''
  );
  const [address, setAddress] = useState(signupData.address ?? '');
  const [state, setState] = useState(signupData.state ?? '');
  const [city, setCity] = useState(signupData.city ?? '');
  const [zip, setZip] = useState(signupData.zip ?? '');

  const infoValid =
    !!athleteFirst &&
    !!athleteLast &&
    !!athleteEmail &&
    !!athletePhone &&
    !!dob &&
    password.length >= 8 &&
    password === confirmPassword &&
    !!address &&
    !!state &&
    !!city &&
    !!zip;

  const onInfoNext = () => {
    setSignupData({
      firstName: athleteFirst,
      lastName: athleteLast,
      email: athleteEmail,
      phone: athletePhone,
      dob,
      pass: password,
      confirmPass: confirmPassword,
      address,
      state,
      city,
      zip,
    });
    setStep('SPORT');
  };

  // -----------------------
  // SPORT
  const [position1, setPosition1] = useState(signupData.pos1 ?? '');
  const [position2, setPosition2] = useState(signupData.pos2 ?? '');
  const [jersey, setJersey] = useState(signupData.jerseyNum ?? '');
  const [gradYear, setGradYear] = useState(signupData.gradYear ?? '');
  const [committed, setCommitted] = useState(!!signupData.college);
  const [college, setCollege] = useState(signupData.college ?? '');
  const [collegeSchool, setCollegeSchool] = useState<FlatSchool | undefined>(
    undefined
  );
  const [commitDate, setCommitDate] = useState<string>('');

  useEffect(() => {
    if (!committed) {
      setCollege('');
      setCollegeSchool(undefined);
      setCommitDate('');
      updateSignupData({ college: '', commitId: undefined });
    }
  }, [committed]);

  const sportValid =
    !!position1 &&
    !!position2 &&
    !!jersey &&
    !!gradYear &&
    (!committed || (!!college && !!collegeSchool));

  const onSportNext = async () => {
    try {
      updateSignupData({
        pos1: position1,
        pos2: position2,
        jerseyNum: jersey,
        gradYear,
        college: committed ? college : '',
      });

      if (committed && collegeSchool) {
        const payload = {
          name: collegeSchool.name,
          state: collegeSchool.state ?? '',
          city: collegeSchool.city ?? '',
          imageUrl: collegeSchool.imageUrl ?? '',
          committedDate: commitDate ? new Date(commitDate) : new Date(),
        };

        const { data: created } = await api.post('/api/commits', payload);

        updateSignupData({
          college: collegeSchool.name,
          commitId: created.id,
        });
      } else {
        updateSignupData({ commitId: undefined });
      }

      setStep('GEAR');
    } catch (err: any) {
      console.error('Commit create error:', err?.response?.data || err);
      Alert.alert('Commit Error', 'Could not save college commitment.');
    }
  };

  // -----------------------
  // GEAR
  const [jerseySize, setJerseySize] = useState(signupData.jerseySize ?? null);
  const [pantSize, setPantSize] = useState(signupData.pantSize ?? null);
  const [stirrupSize, setStirrupSize] = useState(
    signupData.stirrupSize ?? null
  );
  const [shortSize, setShortSize] = useState(signupData.shortSize ?? null);
  const [practiceShirtSize, setPracticeShirtSize] = useState(
    signupData.practiceShirtSize ?? null
  );

  const gearValid =
    !!jerseySize &&
    !!pantSize &&
    !!stirrupSize &&
    !!shortSize &&
    !!practiceShirtSize;

  const handleSubmit = async () => {
    try {
      // 1) create address (optional)
      let addressID: string | undefined;
      if (
        signupData.address &&
        signupData.city &&
        signupData.state &&
        signupData.zip
      ) {
        const { data: address } = await api.post('/api/users/address', {
          address1: signupData.address,
          city: signupData.city,
          state: signupData.state,
          zip: signupData.zip,
        });
        addressID = address.id;
      }

      // 2) create user + embedded player
      const { data } = await api.post('/api/auth/signup', {
        email: signupData.email,
        password: signupData.pass,
        fname: signupData.firstName,
        lname: signupData.lastName,
        phone: signupData.phone,
        role: 'PLAYER',
        player: {
          pos1: signupData.pos1,
          pos2: signupData.pos2,
          jerseyNum: signupData.jerseyNum,
          gradYear: signupData.gradYear,
          college: signupData.college,
          commitId: signupData.commitId,
          ageGroup: signupData.ageDivision,
          jerseySize,
          pantSize,
          stirrupSize,
          shortSize,
          practiceShortSize: practiceShirtSize,
          addressID,
          isTrusted: true,
        },
      });

      const playerId = data.user.player?.id;

      // 3) add to team
      if (playerId && signupData.teamCode) {
        await api.post('/api/players/add-to-team', {
          playerId,
          teamCode: signupData.teamCode,
        });
      }

      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      const { data: me } = await api.get('/api/auth/me');
      queryClient.setQueryData(['currentUser'], me);

      resetSignupData();
      router.replace('/');
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  // -----------------------
  // UI helpers
  const renderHeader = (title: string) => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() =>
          step === startingStep ? router.back() : setStep(prevBackTarget(step))
        }
      >
        <Ionicons name="arrow-back" size={24} color={GlobalColors.white} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  // simple back logic within the stepper
  const prevBackTarget = (s: Step): Step => {
    if (s === 'SPORT') return 'INFO';
    if (s === 'GEAR') return 'SPORT';
    return startingStep; // RESTRICTIONS or INFO
  };

  // STEPS
  const renderRestrictions = () => (
    <>
      {renderHeader('Parent Required')}
      <View
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <Text style={styles.h1}>Parent Required</Text>
        <Text style={styles.msg}>
          Based on the team you requested to join, a parent or guardian must
          register first.
        </Text>
        <Text style={styles.msg}>We apologize for the inconvenience.</Text>
      </View>
      <CustomButton
        title="Back to Login"
        fullWidth
        onPress={() => router.replace('/login')}
      />
    </>
  );

  const renderInfo = () => (
    <>
      {renderHeader('Athlete Info')}
      <Text style={styles.subtitle}>Please enter your player information</Text>

      <CustomInput
        label="Team"
        variant="default"
        fullWidth
        editable={false}
        value={signupData.teamName ?? ''}
      />
      <View style={styles.rowWrapper}>
        <View style={styles.row}>
          <CustomInput
            label="Athlete First Name"
            variant="name"
            style={[styles.half, { color: GlobalColors.white }]}
            value={athleteFirst}
            onChangeText={setAthleteFirst}
            autoCapitalize="words"
          />
          <CustomInput
            label="Athlete Last Name"
            variant="name"
            style={[styles.half, { color: GlobalColors.white }]}
            value={athleteLast}
            onChangeText={setAthleteLast}
            autoCapitalize="words"
          />
        </View>
      </View>
      <CustomInput
        label="Athlete Email"
        variant="email"
        keyboardType="email-address"
        autoCorrect={false}
        autoCapitalize="none"
        fullWidth
        value={athleteEmail}
        onChangeText={setAthleteEmail}
      />
      <CustomInput
        label="Athlete Phone Number"
        variant="default"
        keyboardType="number-pad"
        fullWidth
        value={athletePhone}
        onChangeText={setAthletePhone}
      />
      <DateOfBirthInput onChangeText={setDob} value={dob} />
      <CustomInput
        label="Password"
        variant="password"
        description="Must be atleast 8 Characters"
        fullWidth
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <CustomInput
        label="Confirm Password"
        variant="password"
        fullWidth
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Text style={styles.sectionLabel}>Address Info</Text>
      <CustomInput
        label="Address"
        variant="default"
        fullWidth
        value={address}
        autoCapitalize="words"
        onChangeText={setAddress}
      />
      <CustomSelect
        label="State"
        options={US_STATES}
        defaultValue={state}
        onSelect={setState}
      />
      <View style={styles.row}>
        <CustomInput
          label="City"
          variant="default"
          style={[styles.half, { color: GlobalColors.white }]}
          value={city}
          autoCapitalize="words"
          onChangeText={setCity}
        />
        <CustomInput
          label="Zip Code"
          keyboardType="number-pad"
          variant="default"
          style={[styles.half, { color: GlobalColors.white }]}
          value={zip}
          onChangeText={setZip}
        />
      </View>

      <CustomButton
        title="Continue to Sport Info"
        onPress={onInfoNext}
        fullWidth
        disabled={!infoValid}
      />
    </>
  );

  const renderSport = () => (
    <>
      {renderHeader('Athlete Sport Info')}

      <Text style={styles.subtitle}>
        We now need the athlete’s specific sport information
      </Text>
      <CustomInput
        label="Team"
        variant="default"
        fullWidth
        editable={false}
        value={signupData.teamName ?? ''}
      />

      <View style={styles.row}>
        <CustomSelect
          label="Position 1"
          options={POSITIONS_DROPDOWN}
          defaultValue={position1}
          onSelect={setPosition1}
          style={styles.half}
        />
        <CustomSelect
          label="Position 2"
          options={POSITIONS_DROPDOWN}
          defaultValue={position2}
          onSelect={setPosition2}
          style={styles.half}
        />
      </View>

      <CustomInput
        label="Jersey #"
        variant="default"
        fullWidth
        keyboardType="number-pad"
        value={jersey}
        onChangeText={setJersey}
      />
      <CustomInput
        label="Graduation Year"
        variant="default"
        fullWidth
        keyboardType="number-pad"
        value={gradYear}
        onChangeText={setGradYear}
      />

      <Checkbox
        label="Is this athlete committed to a college?"
        checked={committed}
        onChange={setCommitted}
      />

      {committed && (
        <>
          <SchoolInput
            label="College"
            placeholder="Search for a college"
            value={collegeSchool}
            onChange={(school) => {
              setCollegeSchool(school);
              setCollege(school.name);
            }}
          />
          <CustomInput
            label="College Committed"
            variant="default"
            fullWidth
            value={college}
            onChangeText={setCollege}
          />
        </>
      )}

      <CustomButton
        title="Continue to Gear Info"
        onPress={onSportNext}
        fullWidth
        disabled={!sportValid}
      />
    </>
  );

  const renderGear = () => (
    <>
      {renderHeader('Athlete Gear Info')}

      <Text style={styles.subtitle}>
        Lastly we need the athlete’s gear sizes
      </Text>
      <CustomInput
        label="Team"
        variant="default"
        fullWidth
        editable={false}
        value={signupData.teamName ?? ''}
      />

      <CustomSelect
        label="Jersey Top Size"
        options={JERSEY_SIZES}
        defaultValue={jerseySize ?? undefined}
        onSelect={setJerseySize}
      />
      <CustomSelect
        label="Pant Size"
        options={PANT_SIZES}
        defaultValue={pantSize ?? undefined}
        onSelect={setPantSize}
      />
      <CustomSelect
        label="Stirrup Size"
        options={STIRRUP_SIZES}
        defaultValue={stirrupSize ?? undefined}
        onSelect={setStirrupSize}
      />
      <CustomSelect
        label="Short Size"
        options={SHORTS_SIZES}
        defaultValue={shortSize ?? undefined}
        onSelect={setShortSize}
      />
      <CustomSelect
        label="Practice Short Size"
        options={SHORTS_SIZES}
        defaultValue={practiceShirtSize ?? undefined}
        onSelect={setPracticeShirtSize}
      />

      <CustomButton
        title="Create Player"
        onPress={handleSubmit}
        fullWidth
        disabled={!gearValid}
      />
    </>
  );

  // -----------------------
  // MAIN RENDER
  if (step === 'RESTRICTIONS') {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              {renderRestrictions()}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {/* optional: tiny step indicator */}
            <Text style={styles.stepperText}>
              {step === 'INFO'
                ? 'Step 1 of 3'
                : step === 'SPORT'
                  ? 'Step 2 of 3'
                  : 'Step 3 of 3'}
            </Text>

            {step === 'INFO' && renderInfo()}
            {step === 'SPORT' && renderSport()}
            {step === 'GEAR' && renderGear()}

            {/* footer terms (shared) */}
            <View style={styles.footer}>
              <Text style={styles.terms}>
                By signing up you accept the{' '}
                <Text
                  style={styles.link}
                  onPress={() => router.push('/side/terms')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.link}
                  onPress={() => router.push('/side/privacy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: GlobalColors.white,
    marginRight: 24,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  rowWrapper: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 6,
  },
  half: {
    width: '45%',
  },
  halfLeft: {
    marginRight: 6,
  },
  sectionLabel: {
    fontSize: 20,
    color: GlobalColors.bomber,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  footer: { marginTop: 24, alignItems: 'center', paddingVertical: 16 },
  terms: { fontSize: 12, color: GlobalColors.gray, textAlign: 'center' },
  link: { color: GlobalColors.bomber, textDecorationLine: 'underline' },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  msg: {
    fontSize: 16,
    color: GlobalColors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  stepperText: {
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
});
