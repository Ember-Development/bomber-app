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
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';
import { api, saveTokenPair } from '@/api/api';
import { useQueryClient } from '@tanstack/react-query';
import { useUserContext } from '@/context/useUserContext';

export default function LoginScreen() {
  const router = useRouter();
  const qc = useQueryClient();

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

      await saveTokenPair(data.access, data.refresh);
      api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      setUser(data.user);

      qc.invalidateQueries({ queryKey: ['currentUser'] });

      if (
        data.user.primaryRole === 'PLAYER' &&
        data.user.phone === '0000000000'
      ) {
        router.replace('/signup/finishsignup');
      } else {
        router.replace('/');
      }
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
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              <CustomInput
                label="Password"
                variant="password"
                iconName="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                fullWidth
              />
              <TouchableOpacity
                style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 8 }}
                onPress={() => router.push('/signup/password/forgot-password')}
              >
                <Text
                  style={{
                    color: GlobalColors.bomber,
                    textDecorationLine: 'underline',
                  }}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <CustomButton
                variant="primary"
                title={loading ? 'Logging in…' : 'LOGIN'}
                onPress={() => {
                  console.warn('🔥 handleLogin invoked');
                  handleLogin();
                }}
                disabled={loading}
              />

              <TouchableOpacity
                style={styles.footerLink}
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.switch}>
                  Don’t have an account?{' '}
                  <Text style={styles.switchHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </GlassCard>
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
  footer: { marginTop: 12, alignItems: 'center', paddingVertical: 16 },
  terms: { fontSize: 12, color: GlobalColors.gray, textAlign: 'center' },
  link: { color: GlobalColors.bomber, textDecorationLine: 'underline' },
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
