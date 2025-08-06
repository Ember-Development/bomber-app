import React, { useState, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Keyboard,
  Animated,
} from 'react-native';
import BottomSheetModal from '../../../components/ui/organisms/BottomSheetModal';
import CustomInput from '../../../components/ui/atoms/Inputs';
import CustomButton from '../../../components/ui/atoms/Button';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GlobalColors } from '@/constants/Colors';

interface NameModalProps {
  isVisible: boolean;
  onClose: () => void;
  onNext: (groupName: string) => void;
}

const NameModal: React.FC<NameModalProps> = ({
  isVisible,
  onClose,
  onNext,
}) => {
  const [groupName, setGroupName] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = useSharedValue(300);

  useEffect(() => {
    runOnJS(() => {
      translateY.value = isVisible
        ? withTiming(0, { duration: 250 })
        : withTiming(300, { duration: 250 });
    })();
  }, [isVisible]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <BottomSheetModal
      isVisible={isVisible}
      onClose={onClose}
      title="Enter Group Name"
    >
      <Animated.View style={[styles.animatedContainer, animatedStyles]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={styles.keyboardAvoidingContainer}
        >
          <View
            style={[
              styles.contentContainer,
              { paddingBottom: keyboardHeight || 20 },
            ]}
          >
            <CustomInput
              label="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              variant="default"
              style={styles.input}
              placeholder="Enter Group Name"
            />
            <CustomButton
              title="Next"
              fullWidth
              onPress={() => onNext(groupName)}
            />
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
    marginTop: 30,
  },
  keyboardAvoidingContainer: {
    width: '100%',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  input: {
    width: '100%',
    color: GlobalColors.white,
  },
});

export default NameModal;
