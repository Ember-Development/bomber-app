// app/signup/player-sport.tsx
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
import CustomSelect from '@/components/ui/atoms/dropdown';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import Checkbox from '@/components/ui/atoms/Checkbox';
import { GlobalColors } from '@/constants/Colors';
import { POSITIONS } from '@/utils/enumOptions';

export default function PlayerSportInfo() {
  const router = useRouter();

  const [position1, setPosition1] = useState<string | null>(null);
  const [position2, setPosition2] = useState<string | null>(null);
  const [jersey, setJersey] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [committed, setCommitted] = useState(false);
  const [college, setCollege] = useState('');

  const allFilled =
    !!position1 &&
    !!position2 &&
    !!jersey &&
    !!gradYear &&
    (!committed || !!college);

  const handleContinue = () => {
    router.push('/signup/athlete/athletegear');
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
              <Text style={styles.title}>Athlete Sport Info</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.line1}>
              We now need the athlete’s specific sport information
            </Text>
            <Text style={styles.line2}>
              Your athlete can still download the app, and you will have 100%
              transparency of your athlete on the app.
            </Text>

            {/* Team (readonly) */}
            <CustomInput
              label="Team"
              variant="default"
              placeholder="Texas Bombers Gold 12U"
              fullWidth
              editable={false}
            />

            {/* Positions as dropdowns */}
            <View style={styles.row}>
              <CustomSelect
                label="Position 1"
                options={POSITIONS}
                defaultValue={position1 ?? undefined}
                onSelect={(v) => setPosition1(v)}
                style={styles.half}
              />
              <CustomSelect
                label="Position 2"
                options={POSITIONS}
                defaultValue={position2 ?? undefined}
                onSelect={(v) => setPosition2(v)}
                style={styles.half}
              />
            </View>

            {/* Jersey & Graduation */}
            <CustomInput
              label="Jersey #"
              variant="default"
              fullWidth
              value={jersey}
              onChangeText={setJersey}
            />
            <CustomInput
              label="Graduation Year"
              variant="default"
              fullWidth
              keyboardType="number-pad"
              value={gradYear}
              onChangeText={setGradYear}
            />

            {/* Committed checkbox */}
            <Checkbox
              label="Is this athlete committed to a college?"
              checked={committed}
              onChange={setCommitted}
            />

            {/* College field */}
            {committed && (
              <CustomInput
                label="College Committed"
                variant="default"
                fullWidth
                value={college}
                onChangeText={setCollege}
              />
            )}

            {/* Continue */}
            <CustomButton
              title="Continue to Athlete Gear Info"
              onPress={handleContinue}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  half: {
    flex: 1,
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
