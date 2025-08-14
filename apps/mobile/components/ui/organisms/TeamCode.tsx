import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

interface CodeInputProps {
  length?: number;
  onChange?: (code: string) => void;
}

export default function CodeInput({ length = 5, onChange }: CodeInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<TextInput[]>([]);

  // theme colors
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'component');

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // focus next
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // bubble up full code on any change
    const joined = newCode.join('');
    onChange?.(joined);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, i) => (
        <TextInput
          key={i}
          ref={(ref) => (inputRefs.current[i] = ref!)}
          style={[
            styles.input,
            { borderColor, backgroundColor, color: GlobalColors.black },
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={digit}
          onChangeText={(txt) => handleChange(txt, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          autoFocus={i === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    marginHorizontal: 5,
  },
});
