import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

type CoachingContractProps = {
  lastUpdated?: string;
};

const DEFAULT_UPDATED = 'August 12, 2025';

export default function CoachingContract({
  lastUpdated = DEFAULT_UPDATED,
}: CoachingContractProps) {
  const updatedText = useMemo(() => lastUpdated, [lastUpdated]);
  const router = useRouter();
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bomber Coaching Contract</Text>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>Last Updated: {updatedText}</Text>

          {/* Intro */}
          <Section title="Overview">
            <Paragraph>
              The following contract must be acknowledged by the head coach, all
              assistant coaches, and team admins. While some expectations apply
              more directly to the head coach, all coaches and staff are
              required to fulfill these standards. We know no one is perfect—
              coaches, parents, and players included. But the behavior of the
              coaching staff sets the tone for the entire team, so it’s
              essential we hold ourselves to the highest standards. The goal is
              for everyone—players, parents, and coaches—to be aligned with the
              organization. We’re in this together!
            </Paragraph>
          </Section>

          {/* Commitment */}
          <Section title="Coach Commitment">
            <Paragraph>
              I commit to serve as a coach of my Bomber team. I understand that
              how I carry myself on and off the field is critical—players and
              parents model this behavior. I will follow these principles,
              rules, and guidelines:
            </Paragraph>

            <NumberedList
              items={[
                'Model the same core expectations set for all players and parents. If a standard is reasonable for them, it applies to me as well.',
                'Handle all team funds (dues, donations, any sources) with a fiduciary obligation to the Team. Funds belong to the Team and must be used solely for the Team’s best interest. Misuse or misappropriation creates personal liability for those responsible.',
                'Practice high ethical standards and direct the Team to always play within the rules of fair play—regardless of whether rules are strictly enforced.',
                'Thoroughly learn and maintain an understanding of official rules and the tournament rules we play under. Be a student of the rulebooks and prepared.',
                'Prepare players for the situations they’ll face. Use practice intentionally to teach game situations and set clear expectations so players are positioned to succeed.',
                'Maintain clear, written Team rules and expectations for players, parents, and coaches.',
                'Consistently hold coaches, players, and parents accountable to Team and Bomber Organizational rules.',
                'Set clear expectations for Team philosophy, standards, and attitude. Communicate schedules and Team information in a timely manner via email, text, apps, handouts, or other tools.',
                'Put the Team first. Treat all players fairly—including my own children. Evaluate roles and assignments as objectively as possible.',
                'Teach the game and life lessons along the way. Players are developing into young adults and deserve to be treated with respect.',
                'Ensure the Team is physically and mentally prepared. Encourage use of sanctioned/proper equipment. Provide appropriate training equipment and facilities, and be prepared for any situation.',
                'Head Coach makes final decisions on roles, positions, lineups, and playing time in good faith—based on ability, effort, teamwork, preparedness, execution, and fulfillment of Team rules and philosophy.',
                'Arrive before players when possible—and at minimum, on time—for practices and games. Hold players to the same standard.',
                'Prioritize growth and learning. Winning matters, but it is secondary to commitment to Bomber core values.',
              ]}
            />
            <Paragraph>
              I understand that infractions may affect my standing as a coach
              and, where applicable, my child’s standing as a player. I will
              represent the Team and Bomber Organization with integrity at all
              times.
            </Paragraph>
          </Section>

          {/* Organization Rules */}
          <Section title="Bomber Organization Rules">
            <NumberedList
              start={1}
              items={[
                'Bombers Fastpitch is a nationally respected brand. Your actions reflect on everyone who wears it. Do not defame the organization or sponsors, including on social media.',
                'Teams may not create their own uniforms, spirit wear, fan gear, coaching attire, or headwear. The Bomber Brand, logos, and likeness are trademarked and require approval from Bombers Fastpitch, Inc. Unapproved use may result in removal from the Team/Organization and legal action.',
                'Organizational fees are paid September through July and are due on or before the 6th of each month. Late teams incur a $5 per-player late fee (max $50). Teams two months behind are temporarily removed from the program and may not play under the Bomber Brand until payments are current.',
                'Participation in Bomber Organization and Team activities is voluntary, and participants assume inherent risks of fastpitch softball. The Bomber Organization, Team, and affiliates are not liable for injuries arising from inherent risks of play.',
                'All players must have appropriate insurance coverage. Parents are responsible for obtaining and maintaining adequate coverage before participating in any Bomber Organization or Team event. Most team/tournament policies are secondary, not primary. Bombers Fastpitch is not responsible for injuries from games or practices.',
              ]}
            />
          </Section>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

/** ---------- Helpers ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function NumberedList({
  items,
  start = 1,
}: {
  items: string[];
  start?: number;
}) {
  return (
    <View style={styles.list}>
      {items.map((text, idx) => (
        <View key={idx} style={styles.numItem}>
          <Text style={styles.numLabel}>{`${start + idx}.`}</Text>
          <Text style={styles.listText}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

/** ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.select({ ios: 8, android: 12 }),
    paddingBottom: 8,
  },
  backButton: { marginRight: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#B8B8C3',
    marginBottom: 16,
  },
  section: {
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionBody: { gap: 8 },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#EDEDF2',
  },
  list: {
    marginTop: 6,
    marginBottom: 2,
  },
  numItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  numLabel: {
    color: '#EDEDF2',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 1,
    minWidth: 18,
    textAlign: 'right',
  },
  listText: {
    flex: 1,
    color: '#EDEDF2',
    fontSize: 14,
    lineHeight: 20,
  },
});
