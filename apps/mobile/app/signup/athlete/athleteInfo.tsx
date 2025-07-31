import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';
import DateOfBirthInput from '@/components/ui/atoms/DOBInput';
import { usePlayerSignup } from '@/context/PlayerSignupContext';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { US_STATES } from '../../../utils/state';

export default function AthleteInfo() {
  const router = useRouter();
  const { signupData, setSignupData } = usePlayerSignup();

  // Prefilled form state
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

  const handleContinue = () => {
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

    router.push('/signup/athlete/athletesport');
  };

  const allFilled =
    !!athleteFirst &&
    !!athleteLast &&
    !!athleteEmail &&
    !!athletePhone &&
    !!dob &&
    !!confirmPassword &&
    password.length >= 8 &&
    password === confirmPassword &&
    !!address &&
    !!state &&
    !!city &&
    !!zip;

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
            {/* header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={GlobalColors.white}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Athlete Info</Text>
            </View>

            {/* description */}
            <Text style={styles.line1}>
              Please Enter your Player Information
            </Text>

            {/* selected team */}
            <CustomInput
              label="Team"
              variant="default"
              placeholder={signupData.teamName ?? 'Nothing'}
              fullWidth
              editable={false}
              value={signupData.teamName ?? ''}
            />

            {/* athlete fields */}
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <CustomInput
                  label="Athlete First Name"
                  variant="name"
                  style={[
                    styles.half,
                    styles.halfLeft,
                    { color: GlobalColors.white },
                  ]}
                  value={athleteFirst}
                  onChangeText={setAthleteFirst}
                />
                <CustomInput
                  label="Athlete Last Name"
                  variant="name"
                  style={[styles.half, { color: GlobalColors.white }]}
                  value={athleteLast}
                  onChangeText={setAthleteLast}
                />
              </View>
            </View>

            <CustomInput
              label="Athlete Email"
              variant="email"
              keyboardType="email-address"
              fullWidth
              value={athleteEmail}
              onChangeText={setAthleteEmail}
            />

            <CustomInput
              label="Athlete Phone Number"
              variant="default"
              placeholder="Enter Your Phone Number"
              keyboardType="number-pad"
              fullWidth
              value={athletePhone}
              onChangeText={setAthletePhone}
            />

            <DateOfBirthInput onChangeText={setDob} value={dob} />

            <CustomInput
              label="Password"
              variant="password"
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

            {/* address */}
            <View style={styles.addressHeader}>
              <Text style={styles.addressLabel}>Address Info</Text>
            </View>

            <CustomInput
              label="Address"
              variant="default"
              fullWidth
              value={address}
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
                onChangeText={setCity}
              />
              <CustomInput
                label="Zip Code"
                variant="default"
                style={[styles.half, { color: GlobalColors.white }]}
                value={zip}
                onChangeText={setZip}
              />
            </View>

            {/* continue */}
            <CustomButton
              title="Continue to Player Sport Info"
              onPress={handleContinue}
              fullWidth
              disabled={!allFilled}
            />

            {/* terms */}
            <View style={styles.footer}>
              <Text style={styles.terms}>
                By signing up you accept the{' '}
                <Text style={styles.link}>Terms of Service</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: GlobalColors.white,
    marginRight: 24,
    letterSpacing: 1,
  },
  line1: {
    fontSize: 16,
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 8,
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 20,
    color: GlobalColors.bomber,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 16,
  },
  terms: {
    fontSize: 12,
    color: GlobalColors.gray,
    textAlign: 'center',
  },
  link: {
    color: GlobalColors.bomber,
    textDecorationLine: 'underline',
  },
});
