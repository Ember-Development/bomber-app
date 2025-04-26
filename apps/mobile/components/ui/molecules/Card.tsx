import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

interface CardProps {
  type: 'info' | 'quickAction' | 'groupChat' | 'trophy';
  title?: string;
  subtitle?: string;
  image?: any;
  icon?: any;
  onPress?: () => void;
  additionalInfo?: string;
}

export default function Card({
  type,
  title,
  subtitle,
  image,
  icon,
  onPress,
  additionalInfo,
}: CardProps) {
  const component = useThemeColor({}, 'component');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: component },
        type === 'quickAction' && styles.quickAction,
      ]}
      onPress={onPress}
    >
      {image && <Image source={image} style={styles.image} />}
      {icon && <Image source={icon} style={styles.icon} />}

      <View style={styles.textContainer}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {typeof title === 'string' ? title : String(title)}
        </ThemedText>
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
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'semibold',
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
