// app/login/index.tsx
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
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import GlassCard from '@/components/ui/molecules/GlassCard';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';
import { api } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useUserContext } from '@/context/useUserContext';

export default function LoginScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useUserContext();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', { email, password });

      // 1) store tokens
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);

      setUser(data.user);

      // 3) navigate to home
      router.replace('/');
    } catch (err: any) {
      console.error('Login error', err);
      setError(
        err.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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

              {error && <Text style={styles.errorText}>{error}</Text>}

              <CustomButton
                variant="primary"
                title={loading ? 'Logging in…' : 'LOGIN'}
                onPress={handleLogin}
                disabled={loading}
              />

              <TouchableOpacity
                style={styles.footerLink}
                onPress={() => router.push('/signup/role')}
              >
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
  errorText: {
    color: GlobalColors.red,
    textAlign: 'center',
    marginVertical: 8,
  },
});
