// components/ui/atoms/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

interface CustomButtonProps {
  title?: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'text';
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  activeOpacity?: number;
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  iconName,
  fullWidth = false,
  activeOpacity = 0.6,
  disabled = false,
}: CustomButtonProps) {
  const bomber = useThemeColor({}, 'component');
  const component = useThemeColor({}, 'component');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'icon' && styles.iconButton,
        variant === 'text' && styles.textButton,
        fullWidth && styles.fullWidth,
      ]}
    >
      {variant === 'icon' && iconName ? (
        <Ionicons name={iconName} size={20} color={component} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'text' && styles.textVariantText,
            variant === 'danger' && styles.dangerVariantText,
            disabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    minWidth: 120,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    ...Platform.select({
      web: { backdropFilter: 'blur(12px)' },
      default: {},
    }),
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  danger: {
    backgroundColor: 'rgba(255, 0, 0, 0.10)',
    borderColor: 'rgba(255, 0, 0, 0.25)',
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 0,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 0,
  },
  disabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontWeight: '500',
    textAlign: 'center',
    color: GlobalColors.bomber,
  },
  secondaryText: {
    color: GlobalColors.white,
  },
  dangerVariantText: {
    color: GlobalColors.white,
  },
  textVariantText: {
    color: GlobalColors.bomber,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledText: {
    color: GlobalColors.gray,
  },
  fullWidth: {
    width: '100%',
  },
});
