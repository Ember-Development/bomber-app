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
    nextRoute: '/signup/player-amount',
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
  const { role } = useLocalSearchParams<{
    role?: string;
  }>();
  const [selection, setSelection] = React.useState<string | null>(null);
  const selectedChoice = choices.find((c) => c.key === selection);

  const onContinue = () => {
    if (selectedChoice) {
      const coachPlayer = (selectedChoice.key === 'yes').toString();
      router.push({
        pathname: selectedChoice.nextRoute,
        params: { role, coachPlayer },
      });
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
              <Text style={styles.title}>Coach Parent-Players?</Text>
            </View>

            {/* Prompt */}
            <Text style={styles.line1}>
              Do you have any players you also wish to register as their parent?
            </Text>

            {/* Choice cards */}
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

            {/* Detail message */}
            {selectedChoice && (
              <Text style={styles.line2}>{selectedChoice.message}</Text>
            )}

            {/* Continue */}
            <CustomButton
              title={selectedChoice?.buttonText ?? 'Continue'}
              onPress={onContinue}
              fullWidth
              disabled={!selection}
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
