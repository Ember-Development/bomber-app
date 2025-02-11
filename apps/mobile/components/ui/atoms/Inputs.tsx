import React, { useState, useRef } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Animated,
  TextInputProps,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomInputProps extends TextInputProps {
  label: string;
  variant?: "default" | "password" | "email" | "name";
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export default function CustomInput({
  label,
  variant = "default",
  iconName,
  fullWidth = false,
  secureTextEntry,
  ...props
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const animatedLabel = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabel, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (event: any) => {
    if (!event.nativeEvent.text) {
      setIsFocused(false);
      Animated.timing(animatedLabel, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Animated styles for the floating label
  const labelStyle = {
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 4], // Moves label up
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12], // Shrinks label
    }),
    color: isFocused ? "#5d5d5d" : "#000",
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      <View style={styles.inputWrapper}>
        {iconName && <Ionicons name={iconName} size={20} style={styles.icon} />}

        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>

        <TextInput
          style={[styles.input, iconName && styles.withIcon]}
          placeholder={isFocused ? "" : label}
          placeholderTextColor="transparent"
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={variant === "password" && !isPasswordVisible}
          {...props}
        />

        {variant === "password" && (
          <Pressable onPress={() => setPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={20}
              style={styles.icon}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  fullWidth: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#000",
    position: "relative",
    height: 50,
  },
  label: {
    position: "absolute",
    left: 10,
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#000",
    paddingTop: 10,
  },
  withIcon: {
    marginLeft: 5,
  },
  icon: {
    color: "#000",
    marginHorizontal: 5,
  },
});
