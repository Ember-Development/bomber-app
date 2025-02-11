import React, { useState, useRef } from "react";
import { TextInput, View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ZipCodeInputProps {
  onChangeText?: (text: string) => void;
}

export default function ZipCodeInput({ onChangeText }: ZipCodeInputProps) {
  const [zip, setZip] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(0)).current;

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

  const labelStyle = {
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 4],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: isFocused ? "#d5d5d5" : "#000",
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Animated.Text style={[styles.label, labelStyle]}>
          Zip Code
        </Animated.Text>
        <TextInput
          style={styles.input}
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
