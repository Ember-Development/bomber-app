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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import CustomButton from '@/components/ui/atoms/Button';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const PANEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

export default function ContactScreen() {
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
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText
            type="title"
            style={[styles.headerTitle, { color: textColor }]}
          >
            GET IN TOUCH
          </ThemedText>
          <BlurView intensity={40} tint="light" style={styles.glassPanel}>
            <View style={styles.panelInner}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                OFFICE ADDRESS
              </ThemedText>
              <ThemedText style={[styles.addressText, { color: textColor }]}>
                5615 Bicentennial St
                {'\n'}San Antonio, TX 78219
              </ThemedText>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: componentColor + '33' },
                ]}
              />

              <View style={styles.socialItem}>
                <Ionicons
                  name="logo-instagram"
                  size={20}
                  color={componentColor}
                />
                <ThemedText style={[styles.socialText, { color: textColor }]}>
                  BOMBERSFASTPITCH
                </ThemedText>
                <ThemedText
                  style={[styles.socialLabel, { color: componentColor }]}
                >
                  INSTAGRAM
                </ThemedText>
              </View>

              <View style={styles.socialItem}>
                <Ionicons
                  name="logo-facebook"
                  size={20}
                  color={componentColor}
                />
                <ThemedText style={[styles.socialText, { color: textColor }]}>
                  BOMBERSINC
                </ThemedText>
                <ThemedText
                  style={[styles.socialLabel, { color: componentColor }]}
                >
                  FACEBOOK
                </ThemedText>
              </View>

              <View style={styles.socialItem}>
                <Ionicons
                  name="logo-twitter"
                  size={20}
                  color={componentColor}
                />
                <ThemedText style={[styles.socialText, { color: textColor }]}>
                  BOMBERCACATAW
                </ThemedText>
                <ThemedText
                  style={[styles.socialLabel, { color: componentColor }]}
                >
                  X
                </ThemedText>
              </View>

              <View style={styles.socialItem}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={componentColor}
                />
                <ThemedText style={[styles.socialText, { color: textColor }]}>
                  INFO@BOMBERSFASTPITCH.COM
                </ThemedText>
                <ThemedText
                  style={[styles.socialLabel, { color: componentColor }]}
                >
                  EMAIL
                </ThemedText>
              </View>

              <View style={styles.socialItem}>
                <Ionicons
                  name="logo-youtube"
                  size={20}
                  color={componentColor}
                />
                <ThemedText style={[styles.socialText, { color: textColor }]}>
                  BOMBERSFASTPITCH
                </ThemedText>
                <ThemedText
                  style={[styles.socialLabel, { color: componentColor }]}
                >
                  YOUTUBE
                </ThemedText>
              </View>
            </View>
          </BlurView>

          <BlurView intensity={40} tint="light" style={styles.glassPanel}>
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
                onPress={() => {
                  /* TODO: hook up send logic */
                }}
                variant="primary"
                fullWidth
              />
            </View>
          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    padding: HORIZONTAL_PADDING,
    paddingBottom: 40,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    lineHeight: 36,
    textAlign: 'left',
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
  recaptchaText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
