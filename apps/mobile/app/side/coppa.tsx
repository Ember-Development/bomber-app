import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

export default function CoppaNotice() {
  const router = useRouter();

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>COPPA Notice</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.paragraph}>
            Bombers Fastpitch complies with the Children’s Online Privacy
            Protection Act (COPPA).
          </Text>
          <Text style={styles.paragraph}>
            • For players under the age of 14 (14U and under): A parent or legal
            guardian must create and manage the player’s account.
          </Text>
          <Text style={styles.paragraph}>
            • We do not knowingly collect personal information from children
            under 14 without verified parental consent.
          </Text>
          <Text style={styles.paragraph}>
            • Parents have full rights to review, update, or delete their
            child’s personal information at any time.
          </Text>
          <Text style={styles.paragraph}>
            • Certain app features, such as direct messaging and profile
            editing, are restricted or require parental involvement for 14U
            players.
          </Text>
          <Text style={styles.paragraph}>
            If you believe we have collected personal information from a child
            under 14 without consent, please contact us immediately at [Insert
            Contact Email].
          </Text>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.select({ ios: 8, android: 12 }),
    paddingBottom: 8,
  },
  backButton: { padding: 8, marginRight: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  content: { padding: 20 },
  paragraph: {
    fontSize: 14,
    color: '#EDEDF2',
    marginBottom: 12,
    lineHeight: 20,
  },
});
