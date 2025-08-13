import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import CustomButton from '@/components/ui/atoms/Button';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const PANEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

export default function ContactScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const componentColor = useThemeColor({}, 'component');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  return (
    <BackgroundWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={styles.container}>
        {/* Header with Back button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText
            type="title"
            style={[styles.headerTitle, { color: textColor }]}
          >
            GET IN TOUCH
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <BlurView intensity={40} tint="light" style={styles.glassPanel}>
            <View style={styles.panelInner}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                OFFICE ADDRESS
              </ThemedText>
              <ThemedText style={[styles.addressText, { color: textColor }]}>
                218 Trade Center Dr{'\n'}
                New Braunfels, TX 78130
              </ThemedText>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: componentColor + '33' },
                ]}
              />

              {[
                {
                  icon: 'logo-instagram',
                  label: 'BOMBERSFASTPITCH',
                  tag: 'INSTAGRAM',
                  url: 'https://www.instagram.com/bombersfastpitch',
                },
                {
                  icon: 'logo-facebook',
                  label: 'BOMBERSINC',
                  tag: 'FACEBOOK',
                  url: 'https://www.facebook.com/bombersinc',
                },
                {
                  icon: 'logo-twitter',
                  label: 'BOMBERCACATAW',
                  tag: 'X',
                  url: 'https://twitter.com/bombers_fp',
                },
                {
                  icon: 'mail-outline',
                  label: 'INFO@BOMBERSFASTPITCH.COM',
                  tag: 'EMAIL',
                  url: 'mailto:info@bombersfastpitch.com',
                },
                {
                  icon: 'logo-youtube',
                  label: 'BOMBERSFASTPITCH',
                  tag: 'YOUTUBE',
                  url: 'https://www.youtube.com/@bombersfastpitch',
                },
              ].map((s) => (
                <TouchableOpacity
                  key={s.tag}
                  style={styles.socialItem}
                  onPress={() =>
                    Linking.openURL(s.url).catch((err) =>
                      console.error('Error opening link:', err)
                    )
                  }
                >
                  <Ionicons
                    name={s.icon as any}
                    size={20}
                    color={componentColor}
                  />
                  <ThemedText style={[styles.socialText, { color: textColor }]}>
                    {s.label}
                  </ThemedText>
                  <ThemedText
                    style={[styles.socialLabel, { color: componentColor }]}
                  >
                    {s.tag}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>

          {/* <BlurView intensity={40} tint="light" style={styles.glassPanel}>
            <View style={styles.panelInner}>
              <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                Your Name
              </ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                style={[styles.input, { borderColor: componentColor + '55' }]}
              />

              <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                Your Email
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                style={[styles.input, { borderColor: componentColor + '55' }]}
              />

              <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                Subject
              </ThemedText>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject"
                placeholderTextColor="#999"
                style={[styles.input, { borderColor: componentColor + '55' }]}
              />

              <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                Your Message
              </ThemedText>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Your message..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                style={[
                  styles.textArea,
                  { borderColor: componentColor + '55' },
                ]}
              />

              <CustomButton
                title="SEND YOUR MESSAGE"
                onPress={() => {}}
                variant="primary"
                fullWidth
              />
            </View>
          </BlurView> */}
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },

  contentContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 40,
  },

  glassPanel: {
    width: PANEL_WIDTH,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  panelInner: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    marginVertical: 12,
    width: '100%',
  },

  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.3,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 14,
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.08)',
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
