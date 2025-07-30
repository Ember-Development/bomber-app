// app/signup/address.tsx
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';

export default function AddressInfo() {
  const router = useRouter();
  const {
    role = 'athlete',
    count,
    teamCode,
  } = useLocalSearchParams<{
    role?: string;
    count?: string;
    teamCode?: string;
  }>();

  // Form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [zip, setZip] = useState('');

  // Determine next path based on role
  const handleContinue = () => {
    let pathname: string;
    switch (role) {
      case 'COACH':
        pathname = '/signup/TeamCode';
        break;
      case 'PARENT':
        pathname = '/signup/add-player';
        break;
      default:
        pathname = '/signup/add-player';
    }
    router.push({
      pathname,
      params: { role, count, teamCode, address, city, state: stateValue, zip },
    });
  };

  const instruction = `Please enter your address information.`;

  // Dynamic button text
  const buttonText =
    role === 'COACH'
      ? 'Continue to Team Code'
      : role === 'PARENT'
        ? 'Continue to Player Info'
        : 'Continue to Player Info';

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={GlobalColors.white}
                onPress={() => router.back()}
              />
              <Text style={styles.title}>Address Info</Text>
            </View>

            <Text style={styles.instruction}>{instruction}</Text>

            {/* Form fields */}
            <View style={styles.form}>
              <CustomInput
                label="Street Address"
                variant="default"
                fullWidth
                value={address}
                onChangeText={setAddress}
              />
              <CustomInput
                label="City"
                variant="default"
                value={city}
                onChangeText={setCity}
              />
              <CustomInput
                label="State"
                variant="default"
                value={stateValue}
                onChangeText={setStateValue}
              />
              <CustomInput
                label="Zip Code"
                variant="default"
                fullWidth
                value={zip}
                onChangeText={setZip}
              />
            </View>

            {/* Continue button with dynamic text */}
            <CustomButton
              title={buttonText}
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
    marginBottom: 24,
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
