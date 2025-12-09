import React from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORY_ITEM_WIDTH, CARD_MARGIN } from '@/styles/videoscreenStyle';

interface CategoryCardProps {
  item: { id: string; title: string; videoUrl: string };
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}

export default function CategoryCard({
  item,
  index,
  scrollX,
  onPress,
}: CategoryCardProps) {
  // Animated scaling based on horizontal scroll
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CATEGORY_ITEM_WIDTH + CARD_MARGIN),
      index * (CATEGORY_ITEM_WIDTH + CARD_MARGIN),
      (index + 1) * (CATEGORY_ITEM_WIDTH + CARD_MARGIN),
    ];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.92, 1, 0.92],
      'clamp'
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      'clamp'
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const vidId = item.videoUrl.match(/v=([^&]+)/)?.[1] || '';

  return (
    <Animated.View
      style={[
        { width: CATEGORY_ITEM_WIDTH, marginRight: CARD_MARGIN },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`,
            }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Gradient overlay for better text readability */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
            locations={[0, 0.6, 1]}
            style={styles.gradientOverlay}
          />

          {/* Subtle overlay for overall darkening */}
          <View style={styles.overlay} />

          {/* Play button with background circle */}
          <View style={styles.playButtonContainer}>
            <View style={styles.playButtonBackground} />
            <Ionicons
              name="play"
              size={20}
              color="#fff"
              style={styles.playIcon}
            />
          </View>
        </View>

        {/* Title container with better styling */}
        <View style={styles.titleContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: CATEGORY_ITEM_WIDTH * 0.56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    bottom: 0,
  },
  playButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonBackground: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  playIcon: {
    zIndex: 1,
    marginLeft: 3, // Slight offset to center play icon visually
  },
  titleContainer: {
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
