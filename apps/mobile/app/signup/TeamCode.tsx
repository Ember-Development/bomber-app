import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CodeInput from '@/components/ui/organisms/TeamCode';
import CustomButton from '@/components/ui/atoms/Button';
import Checkbox from '@/components/ui/atoms/Checkbox';
import { GlobalColors } from '@/constants/Colors';
import { useTeamByCode } from '@/hooks/teams/useTeams';
import { Team } from '@bomber-app/database';
import { usePlayerSignup } from '@/context/PlayerSignupContext';
import { useCoachSignup } from '@/context/CoachSignupContext';

export default function TeamCode() {
  const router = useRouter();
  const { role, count, coachPlayer } = useLocalSearchParams<{
    role?: string;
    count?: string;
    coachPlayer?: string;
  }>();
  const num = parseInt(count ?? '1', 10);
  const isCoach = role?.toLowerCase() === 'coach';
  const isParent = role?.toLowerCase() === 'parent';
  const hasPlayers = coachPlayer === 'true';

  const [teamCode, setTeamCode] = useState('');
  const [sameCode, setSameCode] = useState<boolean | null>(
    hasPlayers ? null : true
  );
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [ageDivision, setAgeDivision] = useState<Team['ageGroup'] | null>(null);
  const { data: teamData, isFetching } = useTeamByCode(teamCode);

  const playerSignup = usePlayerSignup();
  const coachSignup = useCoachSignup();
  const selectedTeamName = selectedTeam;

  useEffect(() => {
    if (teamData) {
      setSelectedTeam(teamData.name);
      setAgeDivision(teamData.ageGroup as Team['ageGroup']);

      if (isCoach) {
        coachSignup.setSignupData({
          teamName: teamData.name,
          teamCode: teamData.teamCode ?? '',
          ageDivision: teamData.ageGroup,
        });
      } else {
        playerSignup.setSignupData({
          teamName: teamData.name,
          teamCode: teamData.teamCode ?? '',
          ageDivision: teamData.ageGroup,
        });
      }
    } else {
      setSelectedTeam(null);
      setAgeDivision(null);

      if (isCoach) {
        coachSignup.setSignupData({
          teamName: '',
          teamCode: '',
          ageDivision: undefined,
        });
      } else {
        playerSignup.setSignupData({
          teamName: '',
          teamCode: '',
          ageDivision: undefined,
        });
      }
    }
  }, [teamData]);

  const codeFilled = teamCode.length === 5;
  const canContinue =
    codeFilled && (!isCoach || (isCoach && (!hasPlayers || sameCode !== null)));

  const handleComplete = () => {
    const params: Record<string, string> = {
      role: role ?? '',
      count: count ?? '',
      teamCode,
    };
    if (isCoach && hasPlayers) {
      params.coachPlayerCodeMatches = sameCode ? 'true' : 'false';
    }

    let pathname: string;
    if (isCoach) {
      pathname = '/signup/coach/coach-players';
    } else if (isParent) {
      pathname = '/signup/parent/parentform';
    } else {
      // PLAYER: branch by ageDivision
      if (ageDivision === 'U18' || ageDivision === 'U16') {
        pathname = '/signup/athlete/athleteInfo';
      } else {
        pathname = '/signup/athlete/athleteRestrictions';
      }
    }

    router.push({ pathname, params });
  };

  let instruction =
    num > 1
      ? 'Each Bomber Team has a unique code. Enter your first player’s code below.'
      : 'Each Bomber Team has a unique code. Enter your team code below.';
  if (isCoach) {
    instruction = hasPlayers
      ? 'Enter your team code and whether it applies to your players.'
      : 'Enter the team code for the team you coach.';
  }

  const buttonText = isCoach
    ? 'Continue to Player Info'
    : isParent
      ? 'Parent: Continue'
      : 'Player: Continue';

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={80}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={28}
                    color={GlobalColors.white}
                  />
                </TouchableOpacity>
                <Text style={styles.title}>Bomber Team Code</Text>
              </View>

              <Text style={styles.instruction}>{instruction}</Text>
              <Text style={styles.subInstruction}>
                Check your welcome email for the code.
              </Text>

              <View style={styles.codeWrapper}>
                <CodeInput length={5} onChange={setTeamCode} />
              </View>

              {isCoach && hasPlayers && codeFilled && (
                <View style={styles.checkboxRow}>
                  <Checkbox
                    label="Same code for coach & players?"
                    checked={sameCode === true}
                    onChange={setSameCode}
                  />
                </View>
              )}

              {selectedTeam && (
                <View style={styles.selectedTeamContainer}>
                  <Text style={styles.selectedLabel}>Selected Team</Text>
                  <Text style={styles.selectedTeamText}>
                    {selectedTeamName}
                  </Text>
                </View>
              )}

              {codeFilled && (
                <CustomButton
                  title={buttonText}
                  onPress={handleComplete}
                  fullWidth
                  disabled={!canContinue}
                />
              )}

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
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backButton: { padding: 8 },
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
    color: GlobalColors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  subInstruction: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  codeWrapper: { alignItems: 'center', marginBottom: 24 },
  checkboxRow: { marginBottom: 24, alignItems: 'center' },
  selectedTeamContainer: {
    backgroundColor: `${GlobalColors.bomber}20`,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedLabel: {
    fontSize: 12,
    color: GlobalColors.white,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  selectedTeamText: {
    fontSize: 20,
    fontWeight: '600',
    color: GlobalColors.white,
  },
  footer: {
    marginTop: 'auto',
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
