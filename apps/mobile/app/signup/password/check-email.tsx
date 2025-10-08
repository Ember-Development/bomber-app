import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import GlassCard from '@/components/ui/molecules/GlassCard';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';

export default function CheckEmail() {
  const router = useRouter();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <GlassCard>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.desc}>
            If {String(email)} is registered, we sent a link to reset your
            password. It expires in 15 minutes.
          </Text>

          <CustomButton
            variant="primary"
            title="Open Login"
            onPress={() => router.replace('/login')}
          />
        </GlassCard>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 360,
  },
});
