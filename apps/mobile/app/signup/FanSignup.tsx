// app/signup/fan.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import PhoneInput from '@/components/ui/atoms/PhoneInput';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';

export default function FanSignup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSignup = () => {
    // signup logic
    router.replace('(tabs)');
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Fan</Text>
                <Text style={styles.subTitle}>
                  This section we will need your info as the parent of the
                  bomber athlete
                </Text>
              </View>

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
                  onChangeText={setEmail}
                />
                <CustomInput
                  label="Phone Number"
                  variant="default"
                  keyboardType="phone-pad"
                  fullWidth
                  placeholder="e.g. +1 555-555-5555"
                  value={phone}
                  onChangeText={setPhone}
                />
                <CustomInput
                  label="Password"
                  variant="password"
                  fullWidth
                  value={password}
                  onChangeText={setPassword}
                />
                <CustomInput
                  label="Confirm Password"
                  variant="password"
                  fullWidth
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </View>

              <CustomButton title="Sign Up" onPress={handleSignup} fullWidth />

              <View style={styles.footer}>
                <Text style={styles.terms}>
                  By signing up you accept the{' '}
                  <Text style={styles.link}>Terms of Service</Text> and{' '}
                  <Text style={styles.link}>Privacy Policy</Text>.
                </Text>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GlobalColors.white,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: GlobalColors.gray,
    textAlign: 'center',
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
