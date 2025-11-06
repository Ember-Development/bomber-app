// components/SchoolInput.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { flattenSchools, FlatSchool } from '@/utils/SchoolUtil';
import { useSchools } from '@/hooks/schools/useSchools';
import rawSchools from '../../../assets/data/schools.json';

// Fallback schools in case API is unavailable
const fallbackSchools: FlatSchool[] = flattenSchools(rawSchools);

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

  // Fetch schools from API, with fallback to bundled data
  const { schools, isLoading, isError } = useSchools();
  const allSchools = schools.length > 0 ? schools : fallbackSchools;

  // Debug: check fallback schools
  useEffect(() => {
    if (fallbackSchools.length > 0) {
      console.log(
        '[SchoolInput] Fallback schools total:',
        fallbackSchools.length
      );
      const ancillaInFallback = fallbackSchools.find((s) =>
        s.name.toLowerCase().includes('ancilla')
      );
      if (ancillaInFallback) {
        console.log(
          '[SchoolInput] ✅ Ancilla found in fallback:',
          ancillaInFallback
        );
      } else {
        console.log('[SchoolInput] ❌ Ancilla NOT in fallback');
      }
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(query), debounceMs);
    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  const filteredSchools = useMemo(() => {
    if (!searchTerm.trim()) return allSchools.slice(0, 50); // Limit initial results

    const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);

    if (terms.length === 0) return allSchools.slice(0, 50);

    // Multi-term search: all terms must match
    const results = allSchools.filter((s) => {
      const searchKey = s.searchKey.toLowerCase();
      return terms.every((term) => searchKey.includes(term));
    });

    // Debug: log results for "ancilla"
    if (searchTerm.toLowerCase().includes('ancilla')) {
      console.log('[SchoolInput] Searching for:', searchTerm);
      console.log('[SchoolInput] Total schools:', allSchools.length);
      console.log('[SchoolInput] Results found:', results.length);
      console.log(
        '[SchoolInput] Sample results:',
        results.slice(0, 3).map((s) => s.name)
      );

      // Try to find Ancilla College
      const ancilla = allSchools.find((s) =>
        s.name.toLowerCase().includes('ancilla')
      );
      if (ancilla) {
        console.log('[SchoolInput] Found Ancilla:', ancilla);
        console.log('[SchoolInput] SearchKey:', ancilla.searchKey);
      } else {
        console.log('[SchoolInput] ❌ Ancilla College NOT in allSchools array');
        // Check if it's in raw data
        const inRaw = fallbackSchools.find((s) =>
          s.name.toLowerCase().includes('ancilla')
        );
        if (inRaw) {
          console.log('[SchoolInput] Found in fallbackSchools:', inRaw);
        } else {
          console.log('[SchoolInput] ❌ Not in fallbackSchools either');
        }

        // Check first 10 schools to see structure
        console.log(
          '[SchoolInput] First 10 schools:',
          allSchools.slice(0, 10).map((s) => s.name)
        );
      }
    }

    // Return top 50 results for performance
    return results.slice(0, 50);
  }, [searchTerm, allSchools]);

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
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {filteredSchools.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ color: GLASS_COLORS.placeholder }}>
                  No matches
                </Text>
              </View>
            ) : (
              filteredSchools.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.name}-${item.state}-${idx}`}
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
              ))
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
