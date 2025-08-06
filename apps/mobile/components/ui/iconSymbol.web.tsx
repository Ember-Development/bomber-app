import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

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
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialIcons
      name={MAPPING[name]}
      size={size}
      color={color}
      style={style}
    />
  );
}
