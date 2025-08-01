import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
      [0.9, 1, 0.9],
      'clamp'
    );
    return { transform: [{ scale }] };
  });

  const vidId = item.videoUrl.match(/v=([^&]+)/)?.[1] || '';

  return (
    <Animated.View style={[{ width: CATEGORY_ITEM_WIDTH }, animatedStyle]}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <Image
          source={{ uri: `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` }}
          style={styles.image}
        />
        <View style={styles.overlay} />
        <Ionicons
          name="play-circle"
          size={36}
          color="#fff"
          style={styles.playIcon}
        />
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: CATEGORY_ITEM_WIDTH * 0.56,
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
  },
  playIcon: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 6,
  },
});
