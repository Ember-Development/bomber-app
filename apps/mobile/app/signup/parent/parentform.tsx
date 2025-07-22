// app/signup/parent.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { GlobalColors } from '@/constants/Colors';

export default function ParentInfo() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const handleContinue = () => {
    router.push('/signup/player');
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={GlobalColors.white}
                  onPress={() => router.back()}
                />
                <Text style={styles.title}>Parent Info</Text>
              </View>

              {/* Team display */}
              <CustomInput
                label="Selected Team"
                variant="default"
                placeholder="Texas Bombers Gold 18U"
                fullWidth
                editable={false}
              />

              {/* Form fields */}
              <View style={styles.form}>
                <CustomInput
                  label="First Name"
                  variant="name"
                  fullWidth
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <CustomInput
                  label="Last Name"
                  variant="name"
                  fullWidth
                  value={lastName}
                  onChangeText={setLastName}
                />
                <CustomInput
                  label="Email"
                  variant="email"
                  fullWidth
                  value={email}
                  onChangeText={setEmail}
                />
                <CustomInput
                  label="Phone Number"
                  variant="default"
                  fullWidth
                  value={phone}
                  onChangeText={setPhone}
                />
                <CustomInput
                  label="Address"
                  variant="default"
                  fullWidth
                  value={address}
                  onChangeText={setAddress}
                />
                <CustomInput
                  label="State"
                  variant="default"
                  fullWidth
                  value={state}
                  onChangeText={setState}
                />
                <View style={styles.row}>
                  <CustomInput
                    label="City"
                    variant="default"
                    style={styles.half}
                    value={city}
                    onChangeText={setCity}
                  />
                  <CustomInput
                    label="Zip Code"
                    variant="default"
                    style={styles.half}
                    value={zip}
                    onChangeText={setZip}
                  />
                </View>
              </View>

              {/* Continue */}
              <CustomButton
                title="Continue to Player Info"
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
          </TouchableWithoutFeedback>
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
    fontSize: 28,
    fontWeight: '600',
    color: GlobalColors.white,
    marginRight: 24,
  },
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
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
