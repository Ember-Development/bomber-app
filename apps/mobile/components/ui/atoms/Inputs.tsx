import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TextInputProps,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CustomInputProps extends TextInputProps {
  label: string;
  variant?: 'default' | 'password' | 'email' | 'name';
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  placeholder?: string;
  description?: string;
}

const GLASS_COLORS = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.3)',
  text: '#fff',
  placeholder: 'rgba(255, 255, 255, 0.5)',
  icon: '#fff',
};

export default function CustomInput({
  label,
  variant = 'default',
  iconName,
  fullWidth = false,
  secureTextEntry,
  placeholder,
  description,
  ...props
}: CustomInputProps) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const getPlaceholder = () => {
    switch (variant) {
      case 'password':
        return 'Enter your password';
      case 'email':
        return 'Enter your email';
      case 'name':
        return 'Enter your name';
      default:
        return placeholder || 'Enter Here';
    }
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: GLASS_COLORS.text }]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.subdescription}>{description}</Text>
        )}
      </View>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: GLASS_COLORS.border,
            backgroundColor: GLASS_COLORS.background,
          },
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            style={[styles.icon, { color: GLASS_COLORS.icon }]}
          />
        )}
        <TextInput
          style={[styles.input, { color: GLASS_COLORS.text }]}
          placeholder={getPlaceholder()}
          placeholderTextColor={GLASS_COLORS.placeholder}
          secureTextEntry={variant === 'password' && !isPasswordVisible}
          {...props}
        />
        {variant === 'password' && (
          <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              style={[styles.icon, { color: GLASS_COLORS.icon }]}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  subdescription: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  withIcon: {
    marginLeft: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
});
