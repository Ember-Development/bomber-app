// app/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import GlassCard from '@/components/ui/molecules/GlassCard';
import { GlobalColors } from '@/constants/Colors';
import CustomButton from '@/components/ui/atoms/Button';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require('../assets/images/bomber-icon-blue.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subTitle}>
              Please enter your details to sign in.
            </Text>

            <GlassCard>
              <CustomInput
                label="Email"
                variant="email"
                iconName="mail-outline"
                value={email}
                onChangeText={setEmail}
                fullWidth
              />
              <CustomInput
                label="Password"
                variant="password"
                iconName="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                fullWidth
              />
              <CustomButton
                variant="primary"
                title="LOGIN"
                onPress={() => router.replace('(tabs')}
              />
              <TouchableOpacity onPress={() => router.push('/signup/role')}>
                <Text style={styles.switch}>
                  Don’t have an account?{' '}
                  <Text style={styles.switchHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: GlobalColors.white,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 16,
    color: GlobalColors.gray,
    marginBottom: 32,
  },
  button: {
    backgroundColor: GlobalColors.bomber,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: GlobalColors.bomber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerLink: {
    marginTop: 16,
  },
  switch: {
    color: GlobalColors.white,
    fontSize: 14,
  },
  switchHighlight: {
    color: GlobalColors.bomber,
    fontWeight: '600',
  },
});
