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
import { useThemeColor } from "@/hooks/useThemeColor";

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

  // **Apply Theme Colors**
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "component");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "secondaryText");
  const modalBackground = useThemeColor({}, "background");

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    if (onSelect) onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.inputWrapper,
          { borderColor: borderColor, backgroundColor: backgroundColor },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.text,
            { color: selectedValue ? textColor : placeholderColor },
          ]}
        >
          {selectedValue || label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={textColor}
          style={styles.icon}
        />
      </Pressable>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: modalBackground }]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[styles.optionText, { color: textColor }]}>
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
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    justifyContent: "space-between",
  },
  text: {
    fontSize: 16,
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
    width: 300,
    borderRadius: 10,
    padding: 15,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
});
