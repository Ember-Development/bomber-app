import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import PhoneInput from '@/components/ui/atoms/PhoneInput';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';
import { api } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';

export default function FanSignup() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/signup', {
        email,
        password,
        fname: firstName,
        lname: lastName,
        phone,
        role: 'FAN',
      });

      // 1) store tokens
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);

      // 2) seed the currentUser cache so /me isn’t called until later
      queryClient.setQueryData(['currentUser'], data.user);

      // 3) navigate to home
      router.replace('/');
    } catch (err: any) {
      console.error('Signup error', err);
      setError(
        err.response?.data?.message ||
          'There was a problem signing up. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.header}>
                <View style={styles.headerRow}>
                  <View style={styles.backWrapper}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={GlobalColors.white}
                      onPress={() => router.back()}
                    />
                  </View>
                  <Text style={styles.title}>Fan Signup</Text>
                </View>
                <Text style={styles.subTitle}>
                  Let’s create your Bomber Fan account!
                </Text>
              </View>

              <View style={styles.form}>
                <CustomInput
                  label="First Name"
                  variant="name"
                  fullWidth
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <CustomInput
                  label="Last Name"
                  variant="name"
                  fullWidth
                  autoCapitalize="words"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <CustomInput
                  label="Email"
                  variant="email"
                  fullWidth
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <CustomInput
                  label="Phone Number"
                  variant="default"
                  placeholder="Enter Your Phone Number"
                  keyboardType="number-pad"
                  fullWidth
                  value={phone}
                  onChangeText={setPhone}
                />
                <CustomInput
                  label="Password"
                  description="Must be atleast 8 Characters"
                  variant="password"
                  fullWidth
                  value={password}
                  onChangeText={setPassword}
                />
                <CustomInput
                  label="Confirm Password"
                  variant="password"
                  fullWidth
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <CustomButton
                title={loading ? 'Signing up…' : 'Sign Up'}
                onPress={handleSignup}
                fullWidth
                disabled={loading}
              />

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
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 38,
  },
  backWrapper: {
    position: 'absolute',
    left: 0,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12, // same as your old marginRight
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GlobalColors.white,
    letterSpacing: 1,
    textAlign: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  subTitle: {
    fontSize: 16,
    color: GlobalColors.gray,
    textAlign: 'center',
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
  error: {
    color: GlobalColors.red,
    textAlign: 'center',
    marginBottom: 12,
  },
});
