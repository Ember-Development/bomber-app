import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomButtonProps {
  title?: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary" | "danger" | "icon";
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  variant = "primary",
  iconName,
  fullWidth = false,
}: CustomButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        variant === "icon" && styles.iconButton,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
    >
      {variant === "icon" && iconName ? (
        <Ionicons name={iconName} size={24} color={styles.icon.color} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "secondary" && styles.secondaryText,
            variant === "danger" && styles.dangerText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  secondary: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
  },
  danger: {
    backgroundColor: "red",
  },
  iconButton: {
    backgroundColor: "transparent",
    padding: 8,
    minWidth: 0,
  },
  buttonText: {
    color: "white",
    fontWeight: "light",
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  secondaryText: {
    color: "black",
  },
  dangerText: {
    color: "white",
  },
  icon: {
    color: "black",
  },
});
