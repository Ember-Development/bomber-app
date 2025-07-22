// app/signup/index.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import GlassCard from '@/components/ui/molecules/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { GlobalColors } from '@/constants/Colors';

// Icon type
type IoniconName = keyof typeof Ionicons.glyphMap;

interface Role {
  key: string;
  label: string;
  icon: IoniconName;
}

const roles: Role[] = [
  { key: 'PLAYER', label: 'Player', icon: 'person-outline' },
  { key: 'PARENT', label: 'Parent', icon: 'people-outline' },
  { key: 'COACH', label: 'Coach', icon: 'clipboard-outline' },
  { key: 'FAN', label: 'Fan', icon: 'heart-outline' },
];

export default function SignUpRole() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const onSelectRole = (role: string) => {
    setSelectedRole(role);
    if (role === 'FAN') {
      router.push('/signup/FanSignup');
    } else {
      router.push('/signup/TeamCode');
    }
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Bomber Account Role</Text>
              <Text style={styles.subTitle}>Choose one to get started</Text>
            </View>

            <View style={styles.grid}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={styles.card}
                  onPress={() => onSelectRole(r.key)}
                >
                  <Ionicons
                    name={r.icon}
                    size={40}
                    color={GlobalColors.white}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.cardLabel}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.switch}>
                  Already have an account?{' '}
                  <Text style={styles.switchHighlight}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 64,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GlobalColors.white,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: GlobalColors.gray,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 32,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardLabel: {
    color: GlobalColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 24,
  },
  switch: {
    color: GlobalColors.white,
    fontSize: 14,
    textAlign: 'center',
  },
  switchHighlight: {
    color: GlobalColors.bomber,
    fontWeight: '600',
  },
});
