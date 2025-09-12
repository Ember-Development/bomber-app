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

  const [showCoachDetails, setShowCoachDetails] = useState(false);

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
      ageDivision: ageDivision ?? '',
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
      pathname = '/signup/athlete';
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
                <>
                  <CustomButton
                    title={buttonText}
                    onPress={handleComplete}
                    fullWidth
                    disabled={!canContinue}
                  />

                  {isCoach && (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.noticeText}>
                        By signing up as a coach you accept all responsibilities
                        and duties of a Bomber coach.{' '}
                        <Text
                          style={styles.link}
                          onPress={() => setShowCoachDetails((prev) => !prev)}
                        >
                          {showCoachDetails ? 'Hide details' : 'View details'}
                        </Text>
                      </Text>

                      {showCoachDetails && (
                        <View style={styles.detailsBox}>
                          <ScrollView style={{ maxHeight: 400 }}>
                            <Text style={styles.detailsText}>
                              Bomber Coaching Contract{'\n\n'}
                              The following contract must be acknowledged by the
                              head coach, all assistant coaches, and team
                              admins. While some expectations apply more
                              directly to the head coach, all coaches and staff
                              are required to fulfill these standards. We know
                              no one is perfect—coaches, parents, and players
                              included. But the behavior of the coaching staff
                              sets the tone for the entire team, so it’s
                              essential we hold ourselves to the highest
                              standards. The goal is for everyone—players,
                              parents, and coaches—to be aligned with the
                              organization. We’re in this together!{'\n\n'}I
                              commit to serve as a coach of my Bomber team. I
                              understand that how I carry myself on and off the
                              field is critical—players and parents model this
                              behavior. I will follow these principles, rules,
                              and guidelines:{'\n\n'}
                              1. Model the same core expectations set for all
                              players and parents. If a standard is reasonable
                              for them, it applies to me as well.{'\n'}
                              2. Handle all team funds (dues, donations, any
                              sources) with a fiduciary obligation to the Team.
                              Funds belong to the Team and must be used solely
                              for the Team’s best interest. Misuse or
                              misappropriation creates personal liability for
                              those responsible.{'\n'}
                              3. Practice high ethical standards and direct the
                              Team to always play within the rules of fair
                              play—regardless of whether rules are strictly
                              enforced.{'\n'}
                              4. Thoroughly learn and maintain an understanding
                              of official rules and the tournament rules we play
                              under. Be a student of the rulebooks and prepared.
                              {'\n'}
                              5. Prepare players for the situations they’ll
                              face. Use practice intentionally to teach game
                              situations and set clear expectations so players
                              are positioned to succeed.{'\n'}
                              6. Maintain clear, written Team rules and
                              expectations for players, parents, and coaches.
                              {'\n'}
                              7. Consistently hold coaches, players, and parents
                              accountable to Team and Bomber Organizational
                              rules.{'\n'}
                              8. Set clear expectations for Team philosophy,
                              standards, and attitude. Communicate schedules and
                              Team information in a timely manner via email,
                              text, apps, handouts, or other tools.{'\n'}
                              9. Put the Team first. Treat all players
                              fairly—including my own children. Evaluate roles
                              and assignments as objectively as possible.{'\n'}
                              10. Teach the game and life lessons along the way.
                              Players are developing into young adults and
                              deserve to be treated with respect.{'\n'}
                              11. Ensure the Team is physically and mentally
                              prepared. Encourage use of sanctioned/proper
                              equipment. Provide appropriate training equipment
                              and facilities, and be prepared for any situation.
                              {'\n'}
                              12. Head Coach makes final decisions on roles,
                              positions, lineups, and playing time in good
                              faith— based on ability, effort, teamwork,
                              preparedness, execution, and fulfillment of Team
                              rules and philosophy.{'\n'}
                              13. Arrive before players when possible—and at
                              minimum, on time—for practices and games. Hold
                              players to the same standard.{'\n'}
                              14. Prioritize growth and learning. Winning
                              matters, but it is secondary to commitment to
                              Bomber core values.{'\n\n'}
                              Bomber Organization Rules:{'\n'}
                              1. Bombers Fastpitch is a highly respected and
                              nationally recognized brand. Your actions reflect
                              on everyone who wears it. Do not defame the
                              organization or sponsors, including on social
                              media.{'\n'}
                              2. Teams may not create their own uniforms, spirit
                              wear, fan gear, coaching attire, or headwear. The
                              Bomber Brand, logos, and likeness are trademarked
                              and can only be reproduced with approval from
                              Bombers Fastpitch, Inc. Unapproved use may result
                              in removal from the Team/ Organization and legal
                              action.{'\n'}
                              3. Organizational fees are paid September through
                              July and are due on or before the 6th of each
                              month. Late teams incur a $5 per-player late fee
                              (max $50). Teams two months behind are temporarily
                              removed from the program and may not play under
                              the Bomber Brand until payments are current.{'\n'}
                              4. Participation in Bomber Organization and Team
                              activities is voluntary, and participants assume
                              inherent risks of fastpitch softball. The Bomber
                              Organization, Team, and affiliates are not liable
                              for injuries arising from these inherent risks.
                              {'\n'}
                              5. All players must have appropriate insurance
                              coverage. Parents are responsible for obtaining
                              and maintaining adequate coverage before
                              participating in any Bomber Organization or Team
                              event. Most team/tournament policies are
                              secondary, not primary. Bombers Fastpitch is not
                              responsible for injuries from games or practices.
                            </Text>
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}

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
  noticeText: {
    fontSize: 12,
    color: GlobalColors.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  detailsBox: {
    marginTop: 8,
    backgroundColor: `${GlobalColors.bomber}20`,
    borderRadius: 8,
    padding: 10,
  },
  detailsText: {
    fontSize: 12,
    color: GlobalColors.white,
    lineHeight: 18,
  },
});
