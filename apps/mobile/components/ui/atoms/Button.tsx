import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

interface CustomButtonProps {
  title?: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  iconName,
  fullWidth = false,
}: CustomButtonProps) {
  const backgroundColor = useThemeColor({}, 'button');
  const textColor = useThemeColor({}, 'buttonText');
  const componentButton = useThemeColor({}, 'component');
  const icon = useThemeColor({}, 'icon');

  return (
    <Pressable
      style={[
        styles.button,
        variant === 'primary' && { backgroundColor: backgroundColor },
        variant === 'secondary' && styles.secondary,
        variant === 'secondary' && { backgroundColor: componentButton },
        variant === 'danger' && styles.danger,
        variant === 'icon' && styles.iconButton,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
    >
      {variant === 'icon' && iconName ? (
        <Ionicons name={iconName} size={18} style={{ color: icon }} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { color: textColor },
            variant === 'secondary' && styles.secondaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  secondary: {
    backgroundColor: GlobalColors.white,
    borderWidth: 1,
    borderColor: 'black',
  },
  danger: {
    backgroundColor: GlobalColors.red,
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    minWidth: 0,
  },
  buttonText: {
    fontWeight: 'medium',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  secondaryText: {
    color: GlobalColors.black,
  },
});
