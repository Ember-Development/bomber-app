import React, { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SearchFieldProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchField({
  placeholder = 'Search...',
  onSearch,
}: SearchFieldProps) {
  const [query, setQuery] = useState('');

  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'component');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const placeholderColor = useThemeColor({}, 'secondaryText');

  return (
    <View style={[styles.container, { borderColor, backgroundColor }]}>
      <Ionicons name="search" size={20} color={iconColor} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (onSearch) onSearch(text);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 0.5,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    marginLeft: 5,
  },
});
