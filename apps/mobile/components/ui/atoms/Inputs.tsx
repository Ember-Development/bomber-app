import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TextInputProps,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CustomInputProps extends TextInputProps {
  label: string;
  variant?: 'default' | 'password' | 'email' | 'name';
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  placeholder?: string;
}

export default function CustomInput({
  label,
  variant = 'default',
  iconName,
  fullWidth = false,
  secureTextEntry,
  placeholder,
  ...props
}: CustomInputProps) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  // **Apply Theme Colors**
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'component');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  // Determine Placeholder Based on Variant
  const getPlaceholder = () => {
    switch (variant) {
      case 'password':
        return 'Enter your password';
      case 'email':
        return 'Enter your email';
      case 'name':
        return 'Enter your name';
      default:
        return placeholder || 'Enter Your Value';
    }
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {/* Static Label */}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>

      {/* Input Wrapper */}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: borderColor, backgroundColor: backgroundColor },
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            style={[styles.icon, { color: iconColor }]}
          />
        )}

        <TextInput
          style={[
            styles.input,
            iconName && styles.withIcon,
            { color: textColor },
          ]}
          placeholder={getPlaceholder()}
          placeholderTextColor="#888"
          secureTextEntry={variant === 'password' && !isPasswordVisible}
          {...props}
        />

        {variant === 'password' && (
          <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              style={[styles.icon, { color: iconColor }]}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5, // Add spacing between label and input
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    height: 50,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  withIcon: {
    marginLeft: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
});
