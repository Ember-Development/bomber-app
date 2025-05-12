import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ReadOnlyFieldProps {
  label: string;
  value?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export default function ReadOnlyField({
  label,
  value,
  iconName,
  fullWidth = false,
}: ReadOnlyFieldProps) {
  const backgroundColor = useThemeColor({}, 'component');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[styles.valueWrapper, { backgroundColor: backgroundColor }]}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            style={[styles.icon, { color: iconColor }]}
          />
        )}
        <Text
          style={[
            styles.valueText,
            iconName && styles.withIcon,
            { color: textColor },
          ]}
        >
          {value || '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  valueText: {
    flex: 1,
    height: 45,
    fontSize: 12,
    lineHeight: 45,
  },
  withIcon: {
    marginLeft: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
});
