import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label: string;
  options: SelectOption[];
  onSelect?: (value: string) => void;
  defaultValue?: string;
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
  defaultValue,
}: CustomSelectProps) {
  const [selectedValue, setSelectedValue] = useState(defaultValue ?? null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    if (onSelect) onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
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
              color: selectedValue
                ? GLASS_COLORS.text
                : GLASS_COLORS.placeholder,
            },
          ]}
        >
          {selectedValue || label}
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
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[styles.optionText, { color: GLASS_COLORS.text }]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
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
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    right: 10,
  },
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
  optionText: {
    fontSize: 16,
  },
});
