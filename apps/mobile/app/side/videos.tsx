import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';

import SearchField from '@/components/ui/atoms/Search';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useAllMedia } from '@/hooks/media/useMedia';
import { Media as MediaFE } from '@bomber-app/database';
import { MEDIA_CATEGORIES } from '@/utils/enumOptions';
import CategoryCard from '@/components/ui/molecules/CategoryCard';
import {
  createVideoScreenStyles,
  HERO_EXPANDED_HEIGHT,
  CATEGORY_ITEM_WIDTH,
  CARD_MARGIN,
} from '@/styles/videoscreenStyle';

const { width } = Dimensions.get('window');
const HERO_COLLAPSED_HEIGHT = HERO_EXPANDED_HEIGHT * 0.6;

export default function VideosScreen() {
  const router = useRouter();
  const styles = createVideoScreenStyles();

  const { data: videos, isLoading, error: mediaError } = useAllMedia();
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaFE | null>(null);

  // Vertical hero scroll
  const scrollY = useSharedValue(0);
  const onVerticalScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Horizontal carousel scroll
  const scrollX = useSharedValue(0);
  const onHorizontalScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  // Filter + sort
  const filtered = useMemo(() => {
    if (!videos) return [];
    return videos.filter((v) =>
      v.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [videos, searchText]);

  const featured = useMemo(() => {
    if (!filtered.length) return null;
    return filtered
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
  }, [filtered]);

  const heroStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT],
      [HERO_EXPANDED_HEIGHT, HERO_COLLAPSED_HEIGHT],
      'clamp'
    ),
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], 'clamp'),
  }));

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.safeContainer}>
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 40 }}
          />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  if (mediaError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Error loading videos.</Text>
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explore Videos</Text>
        </View>
        <View style={styles.searchBox}>
          <SearchField
            placeholder="Search videos..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <Animated.ScrollView
          onScroll={onVerticalScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
        >
          {featured && (
            <>
              <Text style={styles.sectionLabel}>Featured Video</Text>
              <Animated.View style={[styles.heroContainer, heroStyle]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedItem(featured)}
                >
                  <Image
                    source={{
                      uri: `https://img.youtube.com/vi/${
                        featured.videoUrl.match(/v=([^&]+)/)?.[1]
                      }/hqdefault.jpg`,
                    }}
                    style={styles.heroImage}
                  />
                  <View style={styles.heroOverlay} />
                  <Text numberOfLines={2} style={styles.heroTitle}>
                    {featured.title}
                  </Text>
                  <Ionicons
                    name="play-circle"
                    size={64}
                    color="#fff"
                    style={styles.heroPlayIcon}
                  />
                </TouchableOpacity>
              </Animated.View>
            </>
          )}

          {MEDIA_CATEGORIES.map((cat) => {
            const items = filtered.filter(
              (v) => v.category === cat.value && v.id !== featured?.id
            );
            if (!items.length) return null;
            return (
              <View key={cat.value} style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {cat.label.toUpperCase()}
                </Text>
                <Animated.FlatList
                  data={items}
                  horizontal
                  keyExtractor={(i) => i.id}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CATEGORY_ITEM_WIDTH + CARD_MARGIN}
                  decelerationRate="fast"
                  contentContainerStyle={styles.carousel}
                  onScroll={onHorizontalScroll}
                  scrollEventThrottle={16}
                  renderItem={({ index, item }) => (
                    <CategoryCard
                      item={item}
                      index={index}
                      scrollX={scrollX}
                      onPress={() => setSelectedItem(item)}
                    />
                  )}
                />
              </View>
            );
          })}
        </Animated.ScrollView>

        <Modal
          visible={!!selectedItem}
          animationType="slide"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.playerContainer}>
            {/* Floating header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedItem(null)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>

              {selectedItem && (
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedItem.title}
                </Text>
              )}
            </View>

            {selectedItem && (
              <YoutubePlayer
                height={(width * 9) / 16}
                width={width}
                videoId={selectedItem.videoUrl.match(/v=([^&]+)/)?.[1] || ''}
                play
                initialPlayerParams={{ controls: true }}
              />
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
