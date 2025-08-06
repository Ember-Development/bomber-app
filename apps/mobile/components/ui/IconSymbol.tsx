import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  console.log('IconSymbol props:', { name, size, color, style });
  const mappedName = MAPPING[name];

  if (!mappedName) {
    console.warn(`[IconSymbol] Missing mapping for: ${name}`);
    // INSTEAD OF RETURNING A <Text> — return a fallback icon!
    return (
      <MaterialIcons
        name="help-outline"
        color={color}
        size={size}
        style={style}
      />
    );
  }

  return (
    <MaterialIcons name={mappedName} color={color} size={size} style={style} />
  );
}
