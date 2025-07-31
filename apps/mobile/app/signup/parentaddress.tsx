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
import { useCoachSignup } from '@/context/CoachSignupContext';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { US_STATES } from '@/utils/state';
import { useParentSignup } from '@/context/ParentSignupContext';
import { api } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ParentAddressInfo() {
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

  const { updateSignupData, signupData } = useParentSignup();

  const [address, setAddress] = useState(signupData.address ?? '');
  const [state, setState] = useState(signupData.state ?? '');
  const [city, setCity] = useState(signupData.city ?? '');
  const [zip, setZip] = useState(signupData.zip ?? '');

  const handleContinue = async () => {
    // Persist address fields in context
    updateSignupData({ address, city, state, zip });

    try {
      // 1) Create Address record
      let addressID: string | undefined;
      if (address && city && state && zip) {
        const { data: newAddr } = await api.post('/api/users/address', {
          address1: address,
          city,
          state,
          zip,
        });
        addressID = newAddr.id;
        updateSignupData({ addressID });
      }

      // 2) Signup Parent, connecting to that address
      const res = await api.post('/api/auth/signup', {
        email: signupData.email,
        password: signupData.password,
        fname: signupData.firstName,
        lname: signupData.lastName,
        phone: signupData.phone,
        role: 'PARENT',
        parent: {
          addressID,
        },
      });

      // Extract the newly created Parent model's ID
      const parentRecord = res.data.user.parent;
      if (!parentRecord || !parentRecord.id) {
        throw new Error('Parent record missing from signup response');
      }
      const parentId = parentRecord.id;
      updateSignupData({ parentId });

      // 3) Store tokens and navigate to AddPlayers
      const { access, refresh } = res.data;
      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);

      router.push('/signup/add-player');
    } catch (err: any) {
      console.error('[PARENT SIGNUP] failed', err);
      // TODO: display error to the user
    }
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
              <Text style={styles.title}>Parent Address Info</Text>
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

            {/* Continue button */}
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
