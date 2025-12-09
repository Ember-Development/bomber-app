import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import SchoolInput from '@/components/ui/atoms/SchoolInput';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import type { FlatSchool } from '@/utils/SchoolUtil';
import { useUpdatePlayer } from '@/hooks/teams/usePlayerById';
import { GlobalColors } from '@/constants/Colors';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  playerId: string;
  currentCollege?: string | null;
  onSuccess?: () => void;
}

export default function CollegeCommitModal({
  isVisible,
  onClose,
  playerId,
  currentCollege,
  onSuccess,
}: Props) {
  const [selectedSchool, setSelectedSchool] = useState<FlatSchool | undefined>(
    undefined
  );
  const [collegeName, setCollegeName] = useState<string>(currentCollege || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens or currentCollege changes
  useEffect(() => {
    if (isVisible) {
      setCollegeName(currentCollege || '');
      setSelectedSchool(undefined);
    }
  }, [isVisible, currentCollege]);

  const { mutateAsync: updatePlayer } = useUpdatePlayer(playerId, {
    onSuccess: () => {
      setIsSubmitting(false);
      Alert.alert('Success', 'College commitment updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            onClose();
            onSuccess?.();
          },
        },
      ]);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      Alert.alert(
        'Error',
        error?.message ||
          'Failed to update college commitment. Please try again.'
      );
    },
  });

  const handleSchoolSelect = (school: FlatSchool) => {
    setSelectedSchool(school);
    setCollegeName(school.name);
  };

  const handleCollegeNameChange = (text: string) => {
    setCollegeName(text);
    // Clear selected school if user manually types
    if (text !== selectedSchool?.name) {
      setSelectedSchool(undefined);
    }
  };

  const handleSave = async () => {
    if (!collegeName.trim()) {
      Alert.alert('Validation Error', 'Please select or enter a college name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePlayer({
        college: collegeName.trim(),
      });
    } catch (error) {
      // Error is handled in the onError callback
      console.error('Error updating college commitment:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedSchool(undefined);
      setCollegeName(currentCollege || '');
      onClose();
    }
  };

  return (
    <FullScreenModal
      isVisible={isVisible}
      onClose={handleClose}
      title="Commit to College"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.description}>
              Enter your college commitment. You can search for your college or
              type it manually.
            </Text>

            <View style={styles.inputSection}>
              <SchoolInput
                label="Search College"
                placeholder="Search for a college"
                value={selectedSchool}
                onChange={handleSchoolSelect}
                fullWidth
              />

              <CustomInput
                label="College Name"
                placeholder="Or enter college name manually"
                variant="default"
                fullWidth
                value={collegeName}
                onChangeText={handleCollegeNameChange}
              />
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton
                title={isSubmitting ? 'Saving...' : 'Save Commitment'}
                onPress={handleSave}
                fullWidth
                disabled={isSubmitting || !collegeName.trim()}
              />

              <CustomButton
                title="Cancel"
                onPress={handleClose}
                fullWidth
                variant="text"
                disabled={isSubmitting}
              />
            </View>
          </View>
        </ScrollView>

        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={GlobalColors.bomber} />
          </View>
        )}
      </KeyboardAvoidingView>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  inputSection: {
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
