import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '@/components/ui/atoms/Button';
import { api } from '@/api/api';
import { useUserContext } from '@/context/useUserContext';
import { useQueryClient } from '@tanstack/react-query';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

export default function VerifyEmailScreen() {
  const { token, email } = useLocalSearchParams();
  const router = useRouter();
  const { refetch } = useUserContext();
  const qc = useQueryClient();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token && email) {
      verifyEmail();
    }
  }, [token, email]);

  const verifyEmail = async () => {
    try {
      const response = await api.get('/api/email-verification/verify', {
        params: { token, email },
      });

      if (response.data.success) {
        setStatus('success');
        // Refresh user data
        await refetch();
        await qc.invalidateQueries({ queryKey: ['user'] });

        // Redirect to home after a brief delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(
        error?.response?.data?.error ||
          'Failed to verify email. Please try again.'
      );
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color="#57a4ff" />
            <ThemedText type="title" style={styles.text}>
              Verifying your email...
            </ThemedText>
          </>
        )}

        {status === 'success' && (
          <>
            <ThemedText type="title" style={styles.text}>
              ✅ Email Verified!
            </ThemedText>
            <ThemedText style={styles.subtext}>
              Your email has been successfully verified. Redirecting...
            </ThemedText>
          </>
        )}

        {status === 'error' && (
          <>
            <ThemedText type="title" style={styles.text}>
              Verification Failed
            </ThemedText>
            <ThemedText style={styles.subtext}>{errorMessage}</ThemedText>
            <CustomButton
              title="Go to Home"
              onPress={() => router.replace('/(tabs)')}
            />
          </>
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  text: {
    marginTop: 16,
    textAlign: 'center',
  },
  subtext: {
    textAlign: 'center',
    opacity: 0.8,
  },
});
