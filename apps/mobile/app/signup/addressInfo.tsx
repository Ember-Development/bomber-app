import React, { useMemo, useState } from 'react';
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
import { useCoachSignup } from '@/context/CoachSignupContext';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { US_STATES } from '@/utils/state';

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

  const { updateSignupData, signupData } = useCoachSignup();

  const [address, setAddress] = useState(signupData.address ?? '');
  const [state, setState] = useState(signupData.state ?? '');
  const [city, setCity] = useState(signupData.city ?? '');
  const [zip, setZip] = useState(signupData.zip ?? '');
  const [touched, setTouched] = useState(false);

  const isFormValid = useMemo(
    () =>
      address.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      zip.trim() !== '',
    [address, city, state, zip]
  );

  const handleContinue = () => {
    setTouched(true);
    if (!isFormValid) return;

    if (role === 'COACH') {
      updateSignupData({
        address,
        city,
        state,
        zip,
      });
    }

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
      params: { role, count, teamCode },
    });
  };

  const instruction = `Please enter your address information.`;

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
              <CustomSelect
                label="State"
                options={US_STATES}
                defaultValue={state}
                onSelect={setState}
              />
              <CustomInput
                label="Zip Code"
                variant="default"
                fullWidth
                value={zip}
                onChangeText={setZip}
              />
            </View>

            {touched && !isFormValid && (
              <Text style={styles.errorText}>
                All fields are required to continue.
              </Text>
            )}

            {/* Continue button */}
            <CustomButton
              title={buttonText}
              onPress={handleContinue}
              fullWidth
              disabled={!isFormValid}
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
  errorText: {
    color: GlobalColors.red,
    textAlign: 'center',
    marginBottom: 12,
  },
});
