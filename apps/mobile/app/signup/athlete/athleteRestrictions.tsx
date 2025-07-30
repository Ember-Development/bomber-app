// app/signup/athleteRestrictions.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';

export default function AthleteRestrictions() {
  const router = useRouter();

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Parent Required</Text>
          <Text style={styles.message}>
            Based on the team you requested to join, a parent or guardian must
            register first.
          </Text>
          <Text style={styles.message}>
            We apologize for the inconvenience.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Back to Home"
            fullWidth
            onPress={() => router.replace('/')}
          />
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: GlobalColors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
});
