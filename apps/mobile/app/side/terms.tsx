import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

type TermsAndConditionsProps = {
  lastUpdated?: string;
};

const DEFAULT_UPDATED = 'August 12, 2025';

export default function TermsAndConditions({
  lastUpdated = DEFAULT_UPDATED,
}: TermsAndConditionsProps) {
  const updatedText = useMemo(() => lastUpdated, [lastUpdated]);
  const router = useRouter();

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Terms and Conditions</Text>
          </View>
          <Text style={styles.subtitle}>Last Updated: {updatedText}</Text>

          <Section number="1" title="Acceptance of Terms">
            <Paragraph>
              By downloading, installing, or using the Bombers Fastpitch mobile
              application (“App”), you agree to be bound by these Terms and
              Conditions (“Terms”). If you do not agree, you must not use the
              App.
            </Paragraph>
          </Section>

          <Section number="2" title="Description of Service">
            <Paragraph>
              Bombers Fastpitch is an organizational management platform for
              Bombers Fastpitch teams, coaches, players, parents, and fans.
              Features include team management, communication tools, media
              sharing, merchandise displays, and event organization.
            </Paragraph>
          </Section>

          <Section number="3" title="Eligibility & Role-Based Access">
            <BulletHeading>Age Requirements & COPPA Compliance:</BulletHeading>
            <Paragraph>
              Players under the age of 14 (“14U and under”) must have a parent
              or legal guardian create and manage their account.
            </Paragraph>
            <BulletHeading>Role-Based Access:</BulletHeading>
            <Paragraph>
              Access to features and data is determined by your assigned role
              (Admin, Regional Coach, Coach, Player, Parent, Fan). Certain
              features may be restricted based on your role.
            </Paragraph>
          </Section>

          <Section number="4" title="User Responsibilities">
            <Paragraph>You agree to:</Paragraph>
            <List>
              <ListItem>
                Provide accurate, current, and complete information.
              </ListItem>
              <ListItem>
                Maintain the security of your account credentials.
              </ListItem>
              <ListItem>
                Use the App only for lawful purposes and in accordance with
                these Terms.
              </ListItem>
            </List>

            <Paragraph>You must not:</Paragraph>
            <List>
              <ListItem>
                Share content that is offensive, obscene, or violates the rights
                of others.
              </ListItem>
              <ListItem>
                Attempt to gain unauthorized access to any part of the App.
              </ListItem>
              <ListItem>
                Use the App for any commercial purposes not authorized by
                Bombers Fastpitch.
              </ListItem>
            </List>
          </Section>

          <Section number="5" title="Content & Media">
            <Paragraph>
              The App may display highlight videos, podcast clips, and other
              media, some of which may contain age warnings. Users under 18
              should have parental guidance when viewing age-sensitive content.
            </Paragraph>
          </Section>

          <Section number="6" title="Merchandise">
            <Paragraph>
              Merchandise links in the App may direct you to third-party
              websites. Bombers Fastpitch is not responsible for transactions
              made outside the App.
            </Paragraph>
          </Section>

          <Section number="7" title="Termination of Use">
            <Paragraph>
              We reserve the right to suspend or terminate your account if you
              violate these Terms or engage in activities that may harm the
              organization or other users.
            </Paragraph>
          </Section>

          <Section number="8" title="Limitation of Liability">
            <Paragraph>
              The App is provided “as is” without warranties of any kind.
              Bombers Fastpitch shall not be liable for any damages arising from
              your use of the App.
            </Paragraph>
          </Section>

          <Section number="9" title="Changes to Terms">
            <Paragraph>
              We may update these Terms from time to time. Continued use of the
              App after changes are posted constitutes acceptance of the revised
              Terms.
            </Paragraph>
          </Section>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

/** ---------- Helpers & Styles ---------- */

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

function BulletHeading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.bulletHeading}>{children}</Text>;
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 8, android: 12 }),
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.select({ ios: 8, android: 12 }),
    paddingBottom: 8,
  },
  backButton: {
    padding: 0,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
  bulletHeading: {
    fontSize: 14,
    lineHeight: 20,
    color: '#EDEDF2',
    fontWeight: '700',
    marginTop: 4,
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
