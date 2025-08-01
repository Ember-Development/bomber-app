// src/components/ui/molecules/FeaturedVideoCard.tsx
import React from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Media as MediaFE } from '@bomber-app/database';

const { width } = Dimensions.get('window');
// Adjusted hero dimensions: slightly reduced height
const HERO_PADDING = 24;
const HERO_WIDTH = width - HERO_PADDING;
const HERO_HEIGHT = ((HERO_WIDTH * 9) / 16) * 0.9; // reduced multiplier

interface FeaturedVideoCardProps {
  video: MediaFE;
  onPress: () => void;
}

export default function FeaturedVideoCard({
  video,
  onPress,
}: FeaturedVideoCardProps) {
  const vidId = video.videoUrl.match(/v=([^&]+)/)?.[1] || '';
  const thumbnailUrl = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <Image source={{ uri: thumbnailUrl }} style={styles.image} />
      <View style={styles.overlay} />
      <Ionicons
        name="play-circle"
        size={56}
        color="#fff"
        style={styles.playIcon}
      />
      <View style={styles.titleWrapper}>
        <Text numberOfLines={2} style={styles.title}>
          {video.title.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: HERO_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#2A2A2A',
    marginVertical: 12,
    elevation: 3,
  },
  image: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playIcon: {
    position: 'absolute',
    top: HERO_HEIGHT / 2 - 28,
    left: HERO_WIDTH / 2 - 28,
  },
  titleWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1,
    lineHeight: 20,
  },
});
