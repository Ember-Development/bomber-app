// app/signup/coach-players.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { GlobalColors } from '@/constants/Colors';
import CustomButton from '@/components/ui/atoms/Button';
import { useCoachSignup } from '@/context/CoachSignupContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useParentSignup } from '@/context/ParentSignupContext';

type Choice = {
  key: string;
  label: string;
  message: string;
  buttonText: string;
  nextRoute: string;
};

const choices: Choice[] = [
  {
    key: 'yes',
    label: 'Yes, I also have players I want to register as a parent',
    message:
      'Great! We’ll gather information for the players you coach as well.',
    buttonText: 'Continue',
    nextRoute: '/signup/add-player',
  },
  {
    key: 'no',
    label: 'No, just my coaching account',
    message:
      'No problem—let’s finish setting up your coach profile and move on.',
    buttonText: 'Continue',
    nextRoute: '/(tabs)',
  },
];

export default function CoachPlayers() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [selection, setSelection] = React.useState<string | null>(null);
  const selectedChoice = choices.find((c) => c.key === selection);

  const queryClient = useQueryClient();
  const { signupData: coachData, resetSignupData } = useCoachSignup();
  const { updateSignupData: setParentData } = useParentSignup();

  const handleSubmitCoachOnly = async () => {
    try {
      let addressID: string | undefined;
      if (
        coachData.address &&
        coachData.city &&
        coachData.state &&
        coachData.zip
      ) {
        const { data: addr } = await api.post('/api/users/address', {
          address1: coachData.address,
          city: coachData.city,
          state: coachData.state,
          zip: coachData.zip,
        });
        addressID = addr.id;
      }

      const { data } = await api.post('/api/auth/signup', {
        email: coachData.email,
        password: coachData.password,
        fname: coachData.firstName,
        lname: coachData.lastName,
        phone: coachData.phone,
        role: 'COACH',
        coach: { addressID, teamCode: coachData.teamCode },
      });

      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      queryClient.setQueryData(['currentUser'], data.user);
      resetSignupData();
      router.replace('/'); // done
    } catch (err) {
      console.error('[COACH ONLY] Signup error:', err);
    }
  };

  const handleSubmitCoachAndParent = async () => {
    try {
      // create address if filled
      let addressID: string | undefined;
      if (
        coachData.address &&
        coachData.city &&
        coachData.state &&
        coachData.zip
      ) {
        console.log('[COACH+PARENT] Creating address for coach:', {
          address1: coachData.address,
          city: coachData.city,
          state: coachData.state,
          zip: coachData.zip,
        });
        const { data: addr } = await api.post('/api/users/address', {
          address1: coachData.address,
          city: coachData.city,
          state: coachData.state,
          zip: coachData.zip,
        });
        addressID = addr.id;
        console.log('[COACH+PARENT] Address created with ID:', addressID);
      }

      // nested create both coach + parent
      console.log('[COACH+PARENT] Signing up coach+parent with payload:', {
        email: coachData.email,
        fname: coachData.firstName,
        lname: coachData.lastName,
        phone: coachData.phone,
        coach: { addressID, teamCode: coachData.teamCode },
        parent: { addressID },
      });

      const { data } = await api.post('/api/auth/signup', {
        email: coachData.email,
        password: coachData.password,
        fname: coachData.firstName,
        lname: coachData.lastName,
        phone: coachData.phone,
        role: 'COACH',
        coach: { addressID, teamCode: coachData.teamCode },
        parent: { addressID },
      });

      console.log('[COACH+PARENT] Signup response:', data);

      // pull out new parent.id
      const parentRec = data.user.parent;
      if (!parentRec?.id) {
        console.error(
          '[COACH+PARENT] No parent record in response:',
          parentRec
        );
        throw new Error('Parent record missing from signup response');
      }

      const parentId = parentRec.id;
      console.log('[COACH+PARENT] New parentId:', parentId);

      // stash into ParentSignupContext for AddPlayersScreen
      setParentData({ parentId, addressID });

      // store tokens + cache
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      queryClient.setQueryData(['currentUser'], data.user);

      resetSignupData(); // clear coach context if you want
      // now jump into your existing AddPlayers flow
      router.replace('/signup/add-player');
    } catch (err) {
      console.error('[COACH+PARENT] Signup error:', err);
    }
  };

  const onContinue = () => {
    if (selection === 'no') {
      handleSubmitCoachOnly();
    } else {
      handleSubmitCoachAndParent();
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
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={GlobalColors.white}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Coach Parent-Players?</Text>
            </View>

            <Text style={styles.line1}>
              Do you have any players you also wish to register as their parent?
            </Text>

            <View style={styles.grid}>
              {choices.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.card,
                    selection === c.key && styles.cardSelected,
                  ]}
                  onPress={() => setSelection(c.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cardLabel,
                      selection === c.key && styles.cardLabelSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedChoice && (
              <Text style={styles.line2}>{selectedChoice.message}</Text>
            )}

            <CustomButton
              title={selectedChoice?.buttonText ?? 'Continue'}
              onPress={onContinue}
              fullWidth
              disabled={!selection}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const CARD_BORDER = 'rgba(255,255,255,0.3)';
const CARD_BG = 'rgba(255,255,255,0.08)';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  cardSelected: {
    borderColor: GlobalColors.bomber,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardLabel: {
    color: GlobalColors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: GlobalColors.bomber,
    fontWeight: '600',
  },
  line2: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginVertical: 24,
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
