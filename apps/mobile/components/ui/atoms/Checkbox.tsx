import React, { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CheckboxProps {
  label: string;
  onChange?: (checked: boolean) => void;
}

export default function Checkbox({ label, onChange }: CheckboxProps) {
  const [checked, setChecked] = useState(false);

  const toggleCheckbox = () => {
    setChecked(!checked);
    if (onChange) onChange(!checked);
  };

  return (
    <Pressable style={styles.container} onPress={toggleCheckbox}>
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
        size={24}
        color="#007BFF"
      />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
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
