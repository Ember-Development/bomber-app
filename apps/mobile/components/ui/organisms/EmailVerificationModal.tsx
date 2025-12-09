import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomButton from '@/components/ui/atoms/Button';
import { api } from '@/api/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

interface EmailVerificationModalProps {
  visible: boolean;
  userEmail: string;
  onVerified: () => void;
  onDismiss: () => void; // Add this prop
}

export default function EmailVerificationModal({
  visible,
  userEmail,
  onVerified,
  onDismiss, // Add this
}: EmailVerificationModalProps) {
  const [email, setEmail] = useState(userEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/email-verification/request', {
        email: email.trim(),
      });
      Alert.alert(
        'Verification Email Sent',
        'Please check your email and click the verification link to verify your email address.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.error || 'Failed to send verification email';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { borderColor: borderColor }]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="mail-outline"
                size={48}
                color={GlobalColors.bomber}
              />
            </View>
            <ThemedText
              type="title"
              style={[styles.title, { color: textColor }]}
            >
              Please Verify Your Email
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}
            >
              Your email has not yet been verified. Please verify so you can
              enjoy all the features the Bomber App continues to create.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Email Address
            </ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.actions}>
            <CustomButton
              title={isSubmitting ? 'Sending...' : 'Send Verification Email'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              fullWidth
            />
            <CustomButton
              title="Not now"
              variant="text"
              onPress={onDismiss}
              disabled={isSubmitting}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    ...Platform.select({
      web: { backdropFilter: 'blur(20px)' },
      default: {},
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(87, 164, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  actions: {
    gap: 12,
  },
});
