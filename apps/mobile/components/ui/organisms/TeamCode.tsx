import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";

interface CodeInputProps {
  length?: number;
  onComplete?: (code: string) => void;
}

export default function CodeInput({ length = 6, onComplete }: CodeInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.join("").length === length && onComplete) {
      onComplete(newCode.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref!)}
          style={styles.input}
          keyboardType="numeric"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    fontSize: 24,
    textAlign: "center",
    marginHorizontal: 5,
    color: "#000",
  },
});
