import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalColors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Option = { label: string; value: string };
type Props = {
  label?: string;
  options: Option[];
  defaultValue?: string;
  onSelect: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
};

export default function SearchableSelect({
  label,
  options,
  defaultValue,
  onSelect,
  placeholder = 'Search…',
  disabled,
  emptyText = 'No results',
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === defaultValue);
    return found?.label ?? 'Select…';
  }, [options, defaultValue]);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label?.toLowerCase().includes(q) || o.value?.toLowerCase().includes(q)
    );
  }, [options, query]);

  const handlePick = (v: string) => {
    onSelect(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.selectBox, disabled && styles.selectBoxDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.valueText}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={18} color={GlobalColors.gray} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            {/* KeyboardAvoidingView keeps the card above the keyboard */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              // Add a little extra offset for safe area + header height
              keyboardVerticalOffset={Platform.select({
                ios: insets.top ? 8 : 0,
                android: 0,
              })}
              style={{ width: '100%' }}
            >
              <SafeAreaView
                style={[
                  styles.modalCard,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                  <TouchableOpacity onPress={() => setOpen(false)}>
                    <Ionicons
                      name="close"
                      size={22}
                      color={GlobalColors.white}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchRow}>
                  <Ionicons name="search" size={16} color={GlobalColors.gray} />
                  <TextInput
                    style={styles.input}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={placeholder}
                    placeholderTextColor={GlobalColors.gray}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    blurOnSubmit={false}
                  />
                  {!!query && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={GlobalColors.gray}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <FlatList
                  data={filtered}
                  keyExtractor={(item) => item.value}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode={
                    Platform.OS === 'ios' ? 'interactive' : 'on-drag'
                  }
                  contentContainerStyle={{ paddingBottom: 16 }}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>{emptyText}</Text>
                  }
                  renderItem={({ item }) => {
                    const isSelected = item.value === defaultValue;
                    return (
                      <TouchableOpacity
                        style={[styles.row, isSelected && styles.rowSelected]}
                        onPress={() => handlePick(item.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.rowText,
                            isSelected && styles.rowTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                        {isSelected ? (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={GlobalColors.bomber}
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  }}
                />
              </SafeAreaView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    color: GlobalColors.white,
    marginBottom: 6,
    fontSize: 13,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  selectBoxDisabled: { opacity: 0.6 },
  valueText: { color: GlobalColors.white },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#111316',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 16,
  },
  modalTitle: { color: GlobalColors.white, fontSize: 16, fontWeight: '700' },

  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    marginHorizontal: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 8 }),
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  input: { flex: 1, color: GlobalColors.white },

  emptyText: {
    textAlign: 'center',
    color: GlobalColors.gray,
    paddingVertical: 16,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowSelected: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rowText: { color: GlobalColors.white, flex: 1, marginRight: 8 },
  rowTextSelected: { color: GlobalColors.bomber, fontWeight: '600' },
});
