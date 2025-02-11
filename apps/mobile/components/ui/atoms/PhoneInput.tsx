import React, { useState, useRef } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Animated,
  Text,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PhoneInputProps {
  onChangeText?: (text: string) => void;
}

export default function PhoneInput({ onChangeText }: PhoneInputProps) {
  const [phone, setPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(0)).current;

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 10);
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}`;
    }
    if (cleaned.length > 6) {
      formatted += `-${cleaned.slice(6)}`;
    }
    setPhone(formatted);
    if (onChangeText) onChangeText(formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabel, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!phone) {
      setIsFocused(false);
      Animated.timing(animatedLabel, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 4], // Moves label up
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12], // Shrinks label
    }),
    color: isFocused ? "#d5d5d5" : "#000",
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Animated.Text style={[styles.label, labelStyle]}>
          Phone Number
        </Animated.Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder={isFocused ? "" : "(123) 456-7890"}
          placeholderTextColor="transparent"
          value={phone}
          onChangeText={formatPhoneNumber}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={14}
        />
      </View>
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
});
