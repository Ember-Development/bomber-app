import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label: string;
  options: SelectOption[];
  onSelect?: (value: string) => void;
}

export default function CustomSelect({
  label,
  options,
  onSelect,
}: CustomSelectProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    if (onSelect) onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.inputWrapper}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={selectedValue ? styles.selectedText : styles.placeholderText}
        >
          {selectedValue || label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#000"
          style={styles.icon}
        />
      </Pressable>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
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
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    height: 50,
    justifyContent: "space-between",
  },
  selectedText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    fontSize: 16,
    color: "#000",
  },
  icon: {
    position: "absolute",
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: 300,
    borderRadius: 10,
    padding: 15,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
});
