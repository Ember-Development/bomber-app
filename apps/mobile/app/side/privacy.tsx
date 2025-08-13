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
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

type PrivacyPolicyProps = {
  lastUpdated?: string;
};

const DEFAULT_UPDATED = 'August 12, 2025';

export default function PrivacyPolicy({
  lastUpdated = DEFAULT_UPDATED,
}: PrivacyPolicyProps) {
  const updatedText = useMemo(() => lastUpdated, [lastUpdated]);
  const router = useRouter();

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safe}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>Last Updated: {updatedText}</Text>

          <Section number="1" title="Information We Collect">
            <Paragraph>
              We collect the following information when you register or use the
              App:
            </Paragraph>
            <List>
              <ListItem>
                <Bold>Account Information:</Bold> Name, email, phone number,
                role.
              </ListItem>
              <ListItem>
                <Bold>Sport Information:</Bold> Position(s), jersey number,
                graduation year, college commitment.
              </ListItem>
              <ListItem>
                <Bold>Address Information:</Bold> For players (14U and above),
                parents, and coaches.
              </ListItem>
              <ListItem>
                <Bold>Uniform Sizing:</Bold> Jersey, pant, stirrup, short, and
                practice shirt sizes.
              </ListItem>
              <ListItem>
                <Bold>Usage Data:</Bold> App interactions, events attended,
                messages sent.
              </ListItem>
            </List>
          </Section>

          <Section number="2" title="Children’s Privacy (COPPA Compliance)">
            <Paragraph>
              We do not knowingly collect personal information from children
              under 14 without verified parental consent. All 14U player
              accounts must be linked to a parent account.
            </Paragraph>
          </Section>

          <Section number="3" title="How We Use Your Information">
            <Paragraph>We use your information to:</Paragraph>
            <List>
              <ListItem>Manage your team and role-based access.</ListItem>
              <ListItem>
                Facilitate communication between authorized users.
              </ListItem>
              <ListItem>
                Display events, rosters, and media relevant to your team.
              </ListItem>
              <ListItem>
                Fulfill merchandise orders through third-party partners (if
                applicable).
              </ListItem>
            </List>
          </Section>

          <Section number="4" title="Information Sharing">
            <Paragraph>
              We do not sell your personal information. We may share data with:
            </Paragraph>
            <List>
              <ListItem>
                Other registered users according to role-based access.
              </ListItem>
              <ListItem>
                Service providers who assist with hosting, messaging, or
                analytics.
              </ListItem>
              <ListItem>Legal authorities when required by law.</ListItem>
            </List>
          </Section>

          <Section number="5" title="Data Security">
            <Paragraph>
              We implement reasonable safeguards to protect your information.
              However, no method of electronic storage is 100% secure, and we
              cannot guarantee absolute security.
            </Paragraph>
          </Section>

          <Section number="6" title="Your Rights">
            <Paragraph>
              You may request to access, correct, or delete your personal
              information by contacting us. Parents can manage or delete their
              child’s account at any time.
            </Paragraph>
          </Section>

          <Section number="7" title="Media & Age-Restricted Content">
            <Paragraph>
              Highlight videos, podcast clips, and other media may be displayed
              within the App. Parental discretion is advised for underage users.
            </Paragraph>
          </Section>

          <Section number="8" title="Changes to Privacy Policy">
            <Paragraph>
              We may update this Privacy Policy from time to time. Any changes
              will be posted in the App, and continued use constitutes
              acceptance of the updated policy.
            </Paragraph>
          </Section>

          <Section number="9" title="Contact Information">
            <Paragraph>
              If you have questions about this Privacy Policy, contact:
            </Paragraph>
            <Paragraph>
              <Bold>Bombers Fastpitch</Bold>
              {'\n'}[Email Address]
              {'\n'}[Mailing Address]
            </Paragraph>
          </Section>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

/** ---------- Helpers ---------- */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {number}. {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function List({ children }: { children: React.ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.listText}>{children}</Text>
    </View>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: '700' }}>{children}</Text>;
}

/** ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.select({ ios: 8, android: 12 }),
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
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
  sectionBody: {
    gap: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#EDEDF2',
  },
  list: {
    marginTop: 6,
    marginBottom: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  bullet: {
    color: '#EDEDF2',
    fontSize: 16,
    lineHeight: 20,
    marginTop: 1,
  },
  listText: {
    flex: 1,
    color: '#EDEDF2',
    fontSize: 14,
    lineHeight: 20,
  },
});
