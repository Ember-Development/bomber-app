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
  color = "#EAEAEA",
  marginVertical = 10,
}: SeparatorProps) {
  return (
    <View
      style={[
        styles.separator,
        {
          width: typeof width === "number" ? width : undefined,
          height,
          backgroundColor: color,
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
