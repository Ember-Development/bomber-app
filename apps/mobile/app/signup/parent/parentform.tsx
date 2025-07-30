// app/signup/parent.tsx
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

const ROLE_LABELS: Record<string, string> = {
  PARENT: 'Parent / Guardian',
  COACH: 'Coach',
};

export default function ParentInfo() {
  const router = useRouter();
  const { role, count, teamCode } = useLocalSearchParams<{
    role?: string;
    count?: string;
    teamCode?: string;
  }>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const title = ROLE_LABELS[role ?? 'PARENT'] ?? 'Contact Info';
  const instruction = `Please enter your contact details as the ${title.toLowerCase()}.`;

  const handleContinue = () => {
    router.push({
      pathname: '/signup/addressInfo',
      params: { role, count, teamCode },
    });
  };

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
            {/* 
            Team display
            <CustomInput
              label="Selected Team"
              variant="default"
              placeholder="Texas Bombers Gold 18U"
              fullWidth
              editable={false}
            /> */}

            {/* Form fields */}
            <View style={styles.form}>
              <CustomInput
                label="First Name"
                variant="name"
                fullWidth
                value={firstName}
                onChangeText={setFirstName}
              />
              <CustomInput
                label="Last Name"
                variant="name"
                fullWidth
                value={lastName}
                onChangeText={setLastName}
              />
              <CustomInput
                label="Email"
                variant="email"
                fullWidth
                value={email}
                keyboardType="email-address"
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
            </View>

            {/* Continue */}
            <CustomButton
              title="Continue to Address Info"
              onPress={handleContinue}
              fullWidth
            />

            {/* Terms */}
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
