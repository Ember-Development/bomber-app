// app/signup/userinfo.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { GlobalColors } from '@/constants/Colors';
import DateOfBirthInput from '@/components/ui/atoms/DOBInput';
import { useCoachSignup } from '../../../context/CoachSignupContext';
import { useParentSignup } from '@/context/ParentSignupContext';

const ROLE_LABELS: Record<string, string> = {
  PARENT: 'Parent / Guardian',
  COACH: 'Coach',
};

export default function CoachInfo() {
  const router = useRouter();
  const { role, count, teamCode } = useLocalSearchParams<{
    role?: string;
    count?: string;
    teamCode?: string;
  }>();

  const { signupData, setSignupData } = useCoachSignup();

  const [firstName, setFirstName] = useState(signupData.firstName || '');
  const [lastName, setLastName] = useState(signupData.lastName || '');
  const [email, setEmail] = useState(signupData.email || '');
  const [phone, setPhone] = useState(signupData.phone || '');
  const [dob, setDob] = useState(signupData.dob || '');
  const [password, setPassword] = useState(signupData.password || '');
  const [confirmPassword, setConfirmPassword] = useState(
    signupData.confirmPassword || ''
  );

  const title = ROLE_LABELS[role ?? 'COACH'] ?? 'Contact Info';
  const instruction = `Please enter your contact details as the ${title.toLowerCase()}.`;

  const handleContinue = () => {
    setSignupData({
      firstName,
      lastName,
      email,
      phone,
      dob,
      password: password,
      confirmPassword: confirmPassword,
      teamCode,
    });

    router.push({
      pathname: '/signup/addressInfo',
      params: { role, count, teamCode },
    });
  };

  const allFilled =
    !!firstName &&
    !!lastName &&
    !!email &&
    !!phone &&
    !!dob &&
    !!confirmPassword &&
    password.length >= 8 &&
    password === confirmPassword;

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={GlobalColors.white}
                onPress={() => router.back()}
              />
              <Text style={styles.title}>{title} Info</Text>
            </View>

            {/* Instruction */}
            <Text style={styles.instruction}>{instruction}</Text>

            {/* Form fields */}
            <View style={styles.form}>
              <CustomInput
                label="First Name"
                variant="name"
                fullWidth
                value={firstName}
                autoCapitalize="words"
                onChangeText={setFirstName}
              />
              <CustomInput
                label="Last Name"
                variant="name"
                fullWidth
                value={lastName}
                autoCapitalize="words"
                onChangeText={setLastName}
              />
              <CustomInput
                label="Email"
                variant="email"
                fullWidth
                value={email}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={setEmail}
              />
              <CustomInput
                label="Phone Number"
                variant="default"
                keyboardType="number-pad"
                fullWidth
                value={phone}
                onChangeText={setPhone}
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
            </View>

            {/* Continue */}
            <CustomButton
              title="Continue to Address Info"
              onPress={handleContinue}
              fullWidth
              disabled={!allFilled}
            />

            {/* Terms */}
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
  container: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 38,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: GlobalColors.white,
    letterSpacing: 1,
  },
  instruction: {
    fontSize: 16,
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  footer: {
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
