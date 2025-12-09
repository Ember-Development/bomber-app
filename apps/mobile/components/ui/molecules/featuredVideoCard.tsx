import React from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MediaDB as MediaFE } from '@bomber-app/database';

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
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Gradient overlay for better visual depth */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.5, 1]}
          style={styles.gradientOverlay}
        />

        {/* Subtle overlay for overall darkening */}
        <View style={styles.overlay} />

        {/* Play button with background circle */}
        <View style={styles.playButtonContainer}>
          <View style={styles.playButtonBackground} />
          <Ionicons
            name="play"
            size={28}
            color="#fff"
            style={styles.playIcon}
          />
        </View>

        {/* Title wrapper with gradient background */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.3, 1]}
          style={styles.titleWrapper}
        >
          <Text numberOfLines={2} style={styles.title}>
            {video.title.toUpperCase()}
          </Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: HERO_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#1a1a1a',
    marginVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playButtonContainer: {
    position: 'absolute',
    top: HERO_HEIGHT / 2 - 32,
    left: HERO_WIDTH / 2 - 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonBackground: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.7)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  playIcon: {
    zIndex: 1,
    marginLeft: 4, // Slight offset to center play icon visually
  },
  titleWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
});
