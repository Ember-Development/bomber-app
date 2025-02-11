import React, { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RadioButtonProps {
  options: { label: string; value: string }[];
  onSelect?: (value: string) => void;
}

export default function RadioButtons({ options, onSelect }: RadioButtonProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View>
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={styles.container}
          onPress={() => {
            setSelected(option.value);
            if (onSelect) onSelect(option.value);
          }}
        >
          <Ionicons
            name={
              selected === option.value ? "radio-button-on" : "radio-button-off"
            }
            size={24}
            color="#007BFF"
          />
          <Text style={styles.label}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
});
