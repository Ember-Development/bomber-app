import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GlobalColors } from '@/constants/Colors';

interface CardProps {
  type: 'info' | 'quickAction' | 'groupChat' | 'trophy';
  title?: string;
  subtitle?: string;
  image?: ImageSourcePropType;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  additionalInfo?: string;
}

export default function Card({
  type,
  title,
  subtitle,
  image,
  iconName,
  onPress,
  additionalInfo,
}: CardProps) {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');

  const safeTitle = title?.toString() ?? '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.card,
        type === 'quickAction' && styles.quickAction,
        type === 'groupChat' && { width: 220, marginRight: 10 },
      ]}
      onPress={onPress}
    >
      {image && <Image source={image} style={styles.image} />}
      {iconName && (
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color={GlobalColors.bomber} />
        </View>
      )}
      <View style={styles.textContainer}>
        {safeTitle && (
          <ThemedText
            style={[styles.title, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {safeTitle}
          </ThemedText>
        )}
        {subtitle && (
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            {typeof subtitle === 'string' ? subtitle : String(subtitle)}
          </Text>
        )}
        {additionalInfo && (
          <Text style={[styles.additionalInfo, { color: secondaryTextColor }]}>
            {typeof additionalInfo === 'string'
              ? additionalInfo
              : String(additionalInfo)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 6,
  },
  iconContainer: {
    marginRight: 8,
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  additionalInfo: {
    fontSize: 12,
    color: '#888',
  },
});
