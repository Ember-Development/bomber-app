import React, { useState, useRef } from "react";
import { TextInput, View, StyleSheet, Animated, Pressable } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface PhoneInputProps {
  onChangeText?: (text: string) => void;
}

export default function PhoneInput({ onChangeText }: PhoneInputProps) {
  const [phone, setPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(0)).current;

  // **Apply Theme Colors**
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "component");
  const textColor = useThemeColor({}, "text");
  const labelColor = useThemeColor({}, "secondaryText");

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

  // **Animated Floating Label Styles**
  const labelStyle = {
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 4], // Moves label up
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12], // Shrinks label
    }),
    color: isFocused ? textColor : textColor, // Label color based on focus
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          { borderColor: borderColor, backgroundColor: backgroundColor },
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          Phone Number
        </Animated.Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
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
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 0.5,
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
    paddingTop: 10,
  },
});
