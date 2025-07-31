import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomSelect from '@/components/ui/atoms/dropdown';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';
import {
  JERSEY_SIZES,
  PANT_SIZES,
  STIRRUP_SIZES,
  SHORTS_SIZES,
} from '@/utils/enumOptions';
import { usePlayerSignup } from '@/context/PlayerSignupContext';
import { api } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';

export default function PlayerGearInfo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signupData, resetSignupData } = usePlayerSignup();

  const [jerseySize, setJerseySize] = useState(signupData.jerseySize ?? null);
  const [pantSize, setPantSize] = useState(signupData.pantSize ?? null);
  const [stirrupSize, setStirrupSize] = useState(
    signupData.stirrupSize ?? null
  );
  const [shortSize, setShortSize] = useState(signupData.shortSize ?? null);
  const [practiceShirtSize, setPracticeShirtSize] = useState(
    signupData.practiceShirtSize ?? null
  );

  const allFilled =
    !!jerseySize &&
    !!pantSize &&
    !!stirrupSize &&
    !!shortSize &&
    !!practiceShirtSize;

  const handleSubmit = async () => {
    try {
      // 1. If address info is filled, create address first
      let addressID: string | undefined;
      if (
        signupData.address &&
        signupData.city &&
        signupData.state &&
        signupData.zip
      ) {
        console.log('[SIGNUP] Creating address with:', {
          address1: signupData.address,
          city: signupData.city,
          state: signupData.state,
          zip: signupData.zip,
        });

        const { data: address } = await api.post('/api/users/address', {
          address1: signupData.address,
          city: signupData.city,
          state: signupData.state,
          zip: signupData.zip,
        });
        addressID = address.id;
      }

      // 2. Create user with embedded player object
      const { data } = await api.post('/api/auth/signup', {
        email: signupData.email,
        password: signupData.pass,
        fname: signupData.firstName,
        lname: signupData.lastName,
        phone: signupData.phone,
        role: 'PLAYER',
        player: {
          pos1: signupData.pos1,
          pos2: signupData.pos2,
          jerseyNum: signupData.jerseyNum,
          gradYear: signupData.gradYear,
          college: signupData.college,
          ageGroup: signupData.ageDivision,
          jerseySize: jerseySize,
          pantSize: pantSize,
          stirrupSize: stirrupSize,
          shortSize: shortSize,
          practiceShortSize: practiceShirtSize,
          addressID,
          isTrusted: true,
        },
      });

      const playerId = data.user.player?.id;

      // 3. Add to team
      if (playerId && signupData.teamCode) {
        console.log('[SIGNUP] Adding player to team:', {
          playerId,
          teamCode: signupData.teamCode,
        });

        await api.post('/api/players/add-to-team', {
          playerId,
          teamCode: signupData.teamCode,
        });
      }

      console.log('[SIGNUP] Signup complete, resetting data and routing home.');
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);

      const { data: me } = await api.get('/api/auth/me');
      queryClient.setQueryData(['currentUser'], me);

      resetSignupData();
      router.replace('/');
    } catch (err) {
      console.error('Signup error:', err);
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
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={GlobalColors.white}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Athlete Gear Info</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.line1}>
              Lastly we need the athlete’s gear sizes
            </Text>
            <Text style={styles.line2}>
              Your athlete can still download the app, and you will have 100%
              transparency of your athlete on the app.
            </Text>

            {/* Team (readonly) */}
            <CustomInput
              label="Team"
              variant="default"
              placeholder={signupData.teamName ?? ''}
              fullWidth
              editable={false}
              value={signupData.teamName ?? ''}
            />

            {/* Gear size dropdowns */}
            <CustomSelect
              label="Jersey Top Size"
              options={JERSEY_SIZES}
              defaultValue={jerseySize ?? undefined}
              onSelect={setJerseySize}
            />
            <CustomSelect
              label="Pant Size"
              options={PANT_SIZES}
              defaultValue={pantSize ?? undefined}
              onSelect={setPantSize}
            />
            <CustomSelect
              label="Stirrup Size"
              options={STIRRUP_SIZES}
              defaultValue={stirrupSize ?? undefined}
              onSelect={setStirrupSize}
            />
            <CustomSelect
              label="Short Size"
              options={SHORTS_SIZES}
              defaultValue={shortSize ?? undefined}
              onSelect={setShortSize}
            />
            <CustomSelect
              label="Practice Short Size"
              options={SHORTS_SIZES}
              defaultValue={practiceShirtSize ?? undefined}
              onSelect={setPracticeShirtSize}
            />

            {/* Submit */}
            <CustomButton
              title="Create Player"
              onPress={handleSubmit}
              fullWidth
              disabled={!allFilled}
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
    fontWeight: '600',
    color: GlobalColors.white,
    marginRight: 24,
  },
  line1: {
    fontSize: 16,
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  line2: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  footer: {
    marginTop: 'auto',
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
