// components/SchoolInput.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { flattenSchools, FlatSchool } from '@/utils/SchoolUtil';
import rawSchools from '../../../assets/data/schools.json';

const allSchools: FlatSchool[] = flattenSchools(rawSchools);

// Match CustomInput's glass tokens
const GLASS_COLORS = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.3)',
  text: '#fff',
  placeholder: 'rgba(255, 255, 255, 0.5)',
  icon: '#fff',
  surface: 'rgba(17, 17, 17, 0.6)',
};

type Props = {
  label: string;
  value?: FlatSchool;
  onChange: (school: FlatSchool) => void;
  placeholder?: string;
  debounceMs?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
};

export default function SchoolInput({
  label,
  value,
  onChange,
  placeholder = 'Search schools…',
  debounceMs = 250,
  iconName = 'school-outline',
  fullWidth = false,
}: Props) {
  const [query, setQuery] = useState(value?.name || '');
  const [searchTerm, setSearchTerm] = useState(query);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(query), debounceMs);
    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  const filteredSchools = useMemo(() => {
    if (!searchTerm.trim()) return allSchools;
    const lower = searchTerm.toLowerCase();
    return allSchools.filter((s) => s.searchKey.includes(lower));
  }, [searchTerm]);

  const handleSelect = (school: FlatSchool) => {
    onChange(school);
    setQuery(school.name);
    setOpen(false);
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      <Text style={[styles.label, { color: GLASS_COLORS.text }]}>{label}</Text>

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
            style={styles.icon}
            color={GLASS_COLORS.icon}
          />
        )}

        <TextInput
          style={[styles.input, { color: GLASS_COLORS.text }]}
          placeholder={placeholder}
          placeholderTextColor={GLASS_COLORS.placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChangeText={(text) => {
            setQuery(text);
            if (!open) setOpen(true);
          }}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              setOpen(true);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={GLASS_COLORS.icon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown */}
      {open && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: GLASS_COLORS.surface,
              borderColor: GLASS_COLORS.border,
            },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 220 }}
            nestedScrollEnabled
          >
            {filteredSchools.slice(0, 100).map((item, idx) => (
              <TouchableOpacity
                key={`${item.name}-${idx}`}
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.itemText, { color: GLASS_COLORS.text }]}>
                  {item.name}
                </Text>
                {(item.city || item.state) && (
                  <Text
                    style={[
                      styles.subText,
                      { color: GLASS_COLORS.placeholder },
                    ]}
                  >
                    {[item.city, item.state].filter(Boolean).join(', ')}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            {filteredSchools.length === 0 && (
              <View style={styles.empty}>
                <Text style={{ color: GLASS_COLORS.placeholder }}>
                  No matches
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15, zIndex: 10 },
  fullWidth: { width: '100%' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    height: 50,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 }
      : { elevation: 2 }),
  },
  input: { flex: 1, fontSize: 16 },
  icon: { marginRight: 8 },
  dropdown: {
    marginTop: 6,
    borderWidth: 0.5,
    borderRadius: 14,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 }
      : { elevation: 3 }),
  },
  item: { paddingVertical: 10, paddingHorizontal: 12 },
  itemText: { fontSize: 16, fontWeight: '600' },
  subText: { fontSize: 12, marginTop: 2 },
  empty: { paddingVertical: 16, alignItems: 'center' },
});
