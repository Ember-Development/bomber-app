import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface SeparatorProps {
  width?: number | string;
  height?: number;
  color?: string;
  marginVertical?: number;
}

export default function Separator({
  width = "100%",
  height = 1,
  color,
  marginVertical = 10,
}: SeparatorProps) {
  const seperatorColor = useThemeColor({}, "buttonText");
  return (
    <View
      style={[
        styles.separator,
        {
          width: typeof width === "number" ? width : undefined,
          height,
          backgroundColor: color ?? seperatorColor,
          marginVertical,
        },
        typeof width === "string" ? { alignSelf: "stretch" } : {},
      ]}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    alignSelf: "center",
  },
});
