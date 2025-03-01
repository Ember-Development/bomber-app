import React, { useState, useRef } from "react";
import { TextInput, View, StyleSheet, Animated } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ZipCodeInputProps {
  onChangeText?: (text: string) => void;
}

export default function ZipCodeInput({ onChangeText }: ZipCodeInputProps) {
  const [zip, setZip] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(0)).current;

  // **Apply Theme Colors**
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "component");
  const textColor = useThemeColor({}, "text");
  const labelColor = useThemeColor({}, "secondaryText");

  const handleZipChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 5);
    setZip(cleaned);
    if (onChangeText) onChangeText(cleaned);
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
    if (!zip) {
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
    color: isFocused ? textColor : textColor, // Label color changes dynamically
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
          Zip Code
        </Animated.Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          keyboardType="numeric"
          placeholder={isFocused ? "" : "12345"}
          placeholderTextColor="transparent"
          value={zip}
          onChangeText={handleZipChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={5}
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
