import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchField({
  placeholder = 'Search...',
  value,
  onChangeText,
}: SearchFieldProps) {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'component');
  const placeholderColor = useThemeColor({}, 'component');

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={iconColor} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    // Apply backdropFilter conditionally for web platforms
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}), // NOTE: Web only — use BlurView on native if needed
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
