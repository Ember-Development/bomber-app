// app/signup/athlete.tsx
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
import { useRouter } from 'expo-router';
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
    key: 'parentDecides',
    label: 'Have Parent fill out Player Info',
    message:
      'As your athlete is under 14, we’ll collect their details through your parent account. We do recommend that the athlete download the app to stay connected with alerts and upcoming events happening with their team ',
    buttonText: 'Continue to Athlete Info',
    nextRoute: '/signup/athlete/athleteInfo',
  },
  {
    key: 'selfDecides',
    label: 'Have Athlete fill out their own Info',
    message:
      'Your athlete will enter their own info—perfect for older players who can handle it themselves.',
    buttonText: 'Continue to Athlete Link',
    nextRoute: '/signup/athlete-self',
  },
];

export default function AthleteInfo() {
  const router = useRouter();
  const [selection, setSelection] = React.useState<string | null>(null);

  const selectedChoice = choices.find((c) => c.key === selection);

  const onContinue = () => {
    if (selectedChoice) {
      router.push(selectedChoice.nextRoute);
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
              <Text style={styles.title}>Athlete</Text>
            </View>

            {/* Description line 1 */}
            <Text style={styles.line1}>
              Your athlete has been placed on a 14U team. Because of the age
              division we will allow the Parent to make a decision for the
              athlete.
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

            {/* Dynamic line 2 */}
            {selectedChoice && (
              <Text style={styles.line2}>{selectedChoice.message}</Text>
            )}

            {/* Continue button */}
            <CustomButton
              title={selectedChoice?.buttonText ?? 'Continue'}
              onPress={onContinue}
              fullWidth
              activeOpacity={0.8}
              disabled={!selection}
            />

            {/* Footer terms */}
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
    marginBottom: 44,
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
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  continueButton: {
    width: '100%',
    backgroundColor: GlobalColors.bomber,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueDisabled: {
    opacity: 0.4,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
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
