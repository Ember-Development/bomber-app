import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#fff" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.6)"
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
    color: '#fff',
  },
});
