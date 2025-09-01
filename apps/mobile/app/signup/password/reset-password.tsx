import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import GlassCard from '@/components/ui/molecules/GlassCard';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';
import { api } from '@/api/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();

  const initialEmail = useMemo(
    () => (params.email ? String(params.email) : ''),
    [params.email]
  );
  const initialToken = useMemo(
    () => (params.token ? String(params.token) : ''),
    [params.token]
  );

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const e = email.trim().toLowerCase();

    if (!token || token.length < 16) {
      Alert.alert(
        'Missing Link',
        'Your reset link is invalid or missing the token.'
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert(
        'Passwords Don’t Match',
        'Please re-enter the same password.'
      );
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email: e, token, password });
      Alert.alert('Success', 'Your password has been reset. Please log in.');
      router.replace('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired link.';
      Alert.alert('Reset Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subTitle}>
              Choose a new password for your account.
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
                label="Reset Token"
                variant="default"
                iconName="key-outline"
                value={token}
                onChangeText={setToken}
                fullWidth
                autoCapitalize="none"
                autoCorrect={false}
              />

              <CustomInput
                label="New Password"
                variant="password"
                iconName="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                fullWidth
              />

              <CustomInput
                label="Confirm Password"
                variant="password"
                iconName="lock-closed-outline"
                value={confirm}
                onChangeText={setConfirm}
                fullWidth
              />

              <CustomButton
                variant="primary"
                title={loading ? 'Resetting…' : 'Reset Password'}
                onPress={onSubmit}
                disabled={loading}
              />

              <CustomButton
                variant="secondary"
                title="Back to Login"
                onPress={() => router.replace('/login')}
              />
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GlobalColors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: GlobalColors.gray,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 360,
  },
});
