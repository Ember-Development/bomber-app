import React, { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

interface RadioButtonProps {
  options: { label: string; value: string }[];
  onSelect?: (value: string) => void;
}

export default function RadioButtons({ options, onSelect }: RadioButtonProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // **Apply Theme Colors**
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "tint");

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
            color={iconColor}
          />
          <Text style={[styles.label, { color: textColor }]}>
            {option.label}
          </Text>
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
  },
});
