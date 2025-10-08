import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import GlassCard from '@/components/ui/molecules/GlassCard';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';
import { api } from '@/api/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: e });
      router.replace(
        `/signup/password/check-email?email=${encodeURIComponent(e)}`
      );
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subTitle}>
              Enter the email associated with your account. We’ll send a link to
              reset your password.
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

              <CustomButton
                variant="primary"
                title={loading ? 'Sending…' : 'Send Reset Link'}
                onPress={onSubmit}
                disabled={loading}
              />

              <CustomButton
                variant="secondary"
                title="Back to Login"
                onPress={() => router.back()}
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
