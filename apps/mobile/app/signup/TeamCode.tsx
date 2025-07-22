// app/signup/details.tsx
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CodeInput from '@/components/ui/organisms/TeamCode';
import CustomButton from '@/components/ui/atoms/Button';
import { GlobalColors } from '@/constants/Colors';

export default function TeamCode() {
  const router = useRouter();
  const [teamCode, setTeamCode] = useState('');

  useEffect(() => {
    if (teamCode.length === 5) Keyboard.dismiss();
  }, [teamCode]);

  const handleComplete = () => {
    router.push('/signup/parent/parentform');
  };

  const codeFilled = teamCode.length === 5;

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              {/* header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={GlobalColors.white}
                  />
                </TouchableOpacity>
                <Text style={styles.title}>Bomber Team Code</Text>
              </View>

              {/* instructions */}
              <Text style={styles.instruction}>
                Each Bomber Team has a unique code. To ensure you are on the
                correct team please enter your team code.
              </Text>
              <Text style={styles.subInstruction}>
                Check your Bomber welcome email to find team code.
              </Text>

              {/* code inputs */}
              <View style={styles.codeWrapper}>
                <CodeInput length={5} onChange={setTeamCode} />
              </View>

              {/* only show once code filled */}
              {codeFilled && (
                <>
                  <View style={styles.selectedTeamContainer}>
                    <Text style={styles.selectedLabel}>Selected Team</Text>
                    <Text style={styles.selectedName}>Team Alpha</Text>
                  </View>

                  <View style={styles.continueWrapper}>
                    <CustomButton
                      title="Continue"
                      onPress={handleComplete}
                      fullWidth
                    />
                  </View>
                </>
              )}

              {/* footer terms */}
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
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: GlobalColors.white,
    marginRight: 24,
  },
  instruction: {
    fontSize: 16,
    color: GlobalColors.white,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  subInstruction: {
    fontSize: 14,
    color: GlobalColors.gray,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  codeWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  selectedTeamContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  selectedLabel: {
    fontSize: 14,
    color: GlobalColors.gray,
    marginBottom: 4,
  },
  selectedName: {
    fontSize: 24,
    color: GlobalColors.white,
    fontWeight: '600',
    marginBottom: 14,
  },
  continueWrapper: {
    alignItems: 'center',
    marginBottom: 32,
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
