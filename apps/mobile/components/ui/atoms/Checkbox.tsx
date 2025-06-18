import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Checkbox({ label, onChange, checked }: CheckboxProps) {
  const textColor = useThemeColor({}, 'secondaryText');

  const toggleCheckbox = () => {
    if (onChange) onChange(!checked);
  };

  return (
    <Pressable style={styles.container} onPress={toggleCheckbox}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={24}
        color={GlobalColors.bomber}
      />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
  },
});
