import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label: string;
  options: SelectOption[];
  onSelect?: (value: string) => void;
  value?: string; // controlled
  defaultValue?: string; // uncontrolled
  style?: ViewStyle;
}

const GLASS_COLORS = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.3)',
  text: '#fff',
  placeholder: 'rgba(255, 255, 255, 0.5)',
  modalBackground: 'rgba(20, 20, 20, 0.9)',
};

export default function CustomSelect({
  label,
  options,
  onSelect,
  value,
  defaultValue,
  style,
}: CustomSelectProps) {
  const [isModalVisible, setModalVisible] = useState(false);

  // Uncontrolled internal state (only used when `value` isn't provided)
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);

  // Keep internal in sync if defaultValue changes (rare but harmless)
  useEffect(() => {
    if (defaultValue !== undefined && value === undefined) {
      setInternal(defaultValue);
    }
  }, [defaultValue, value]);

  const isControlled = value !== undefined && value !== null;
  const currentValue = isControlled ? value! : (internal ?? undefined);

  const displayLabel = useMemo(() => {
    const match = options.find((o) => o.value === currentValue);
    return match?.label ?? ''; // if nothing selected, we'll show placeholder below
  }, [options, currentValue]);

  const handleSelect = (v: string) => {
    if (!isControlled) setInternal(v);
    onSelect?.(v);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: GLASS_COLORS.text }]}>{label}</Text>

      <Pressable
        style={[
          styles.inputWrapper,
          {
            borderColor: GLASS_COLORS.border,
            backgroundColor: GLASS_COLORS.background,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.text,
            {
              color: currentValue
                ? GLASS_COLORS.text
                : GLASS_COLORS.placeholder,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {currentValue ? displayLabel : label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={GLASS_COLORS.text}
          style={styles.icon}
        />
      </Pressable>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: GLASS_COLORS.modalBackground },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const selected = item.value === currentValue;
                return (
                  <Pressable
                    style={styles.option}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: GLASS_COLORS.text,
                          fontWeight: selected ? '700' : '400',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    height: 50,
    justifyContent: 'space-between',
  },
  text: { fontSize: 16 },
  icon: { position: 'absolute', right: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 30,
    maxHeight: '80%',
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  optionText: { fontSize: 16 },
});
