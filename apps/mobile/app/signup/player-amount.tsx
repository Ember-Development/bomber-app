// app/signup/multiple-players.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomSelect from '@/components/ui/atoms/dropdown';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';

// simple dropdown options for 1–5+
const PLAYER_COUNT = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5+', value: '5+' },
];

export default function PlayerAmount() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{
    role?: string;
  }>();
  const [count, setCount] = useState<string | null>(null);
  const [sameTeam, setSameTeam] = useState<boolean | null>(null);

  const needsTeamQuestion = count && count !== '1';
  const canContinue = !!count && (!needsTeamQuestion || sameTeam !== null);

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back + Title */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={GlobalColors.white}
              />
            </TouchableOpacity>
            <Text style={styles.title}>How Many Players?</Text>
          </View>

          {/* Instruction */}
          <Text style={styles.instruction}>
            How many Bomber players are you registering as their Parent /
            Guardian?
          </Text>
          <Text style={styles.subInstruction}>
            Please enter the number of players you’re registering who have been
            selected for a Bomber team.
          </Text>

          {/* Player count dropdown */}
          <CustomSelect
            label="Number of Players"
            options={PLAYER_COUNT}
            defaultValue={count ?? undefined}
            onSelect={(v) => {
              setCount(v);
              setSameTeam(null); // reset
            }}
          />

          {/* Same-team question */}
          {needsTeamQuestion && (
            <>
              <Text style={styles.subInstruction}>
                Are they all on the same team?
              </Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.choice,
                    sameTeam === true && styles.choiceActive,
                  ]}
                  onPress={() => setSameTeam(true)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      sameTeam === true && styles.choiceTextActive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choice,
                    sameTeam === false && styles.choiceActive,
                  ]}
                  onPress={() => setSameTeam(false)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      sameTeam === false && styles.choiceTextActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Continue */}
          <CustomButton
            title="Next"
            onPress={() =>
              router.push({
                pathname: '/signup/TeamCode',
                params: { count, role },
              })
            }
            fullWidth
            disabled={!canContinue}
          />
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'flex-start',
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
  instruction: {
    fontSize: 16,
    color: GlobalColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  subInstruction: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginVertical: 12,
    marginBottom: 36,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  choice: {
    flex: 1,
    borderWidth: 1,
    borderColor: GlobalColors.bomber,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  choiceActive: {
    backgroundColor: GlobalColors.bomber,
  },
  choiceText: {
    textAlign: 'center',
    color: GlobalColors.bomber,
    fontWeight: '500',
  },
  choiceTextActive: {
    color: '#fff',
  },
});
