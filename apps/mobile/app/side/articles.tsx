import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import {
  createArticleScreenStyles,
  IMAGE_HEIGHT,
  SHEET_HEIGHT,
} from '@/styles/articlescreenStyle';
import Separator from '@/components/ui/atoms/Seperator';
import { useAllArticles, useArticleById } from '@/hooks/media/useArticle';
import { Article as ArticleFE } from '@bomber-app/database';
import { useRouter } from 'expo-router';

export default function ArticlesScreen() {
  const styles = createArticleScreenStyles();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpened, setSheetOpened] = useState(false);

  // Fetch list and individual article
  const {
    data: articles = [],
    isLoading: listLoading,
    error: listError,
  } = useAllArticles();
  const { data: article, isLoading: articleLoading } = useArticleById(
    selectedId || ''
  );

  const sortedArticles = useMemo(() => {
    return [...articles].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [articles]);

  // Bottom sheet translation
  const sheetTranslate = useSharedValue(IMAGE_HEIGHT);

  // Arrow bounce
  const bounce = useSharedValue(0);
  useEffect(() => {
    bounce.value = withRepeat(
      withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  // Image parallax
  const imageOffsetStyle = useAnimatedStyle(() => {
    const delta = IMAGE_HEIGHT - sheetTranslate.value;
    const extra = delta - SHEET_HEIGHT;
    const movement = extra > 0 ? extra : 0;
    return { transform: [{ translateY: -movement }] };
  });

  const openSheet = () => {
    sheetTranslate.value = withTiming(IMAGE_HEIGHT - SHEET_HEIGHT, {
      duration: 500,
    });
    setSheetOpened(true);
  };

  const closeSheet = () => {
    sheetTranslate.value = withTiming(IMAGE_HEIGHT, { duration: 300 });
    setSheetOpened(false);
  };

  const handleBack = () => setSelectedId(null);

  const scrollHandler = useAnimatedScrollHandler((evt) => {
    if (!sheetOpened && evt.contentOffset.y > 50) {
      sheetTranslate.value = withTiming(IMAGE_HEIGHT - SHEET_HEIGHT, {
        duration: 500,
      });
      runOnJS(setSheetOpened)(true);
    }
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = sheetTranslate.value;
    },
    onActive: (evt, ctx: any) => {
      const next = ctx.startY + evt.translationY;
      sheetTranslate.value = Math.max(
        IMAGE_HEIGHT - SHEET_HEIGHT,
        Math.min(IMAGE_HEIGHT, next)
      );
    },
    onEnd: (evt) => {
      if (evt.translationY > SHEET_HEIGHT * 0.25) runOnJS(closeSheet)();
      else
        sheetTranslate.value = withTiming(IMAGE_HEIGHT - SHEET_HEIGHT, {
          duration: 300,
        });
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslate.value }],
  }));

  // Detail view
  if (selectedId) {
    if (articleLoading || !article) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color="#fff" />
        </View>
      );
    }

    return (
      <View style={styles.detailContainer}>
        <View style={styles.imageWrapper}>
          <Animated.Image
            source={{ uri: article.imageUrl! }}
            style={[styles.detailImage, imageOffsetStyle]}
          />
          <TouchableOpacity style={styles.detailBack} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            start={{ x: 0.65, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.detailHeaderOverlay}
          >
            <Text style={styles.detailTitle}>{article.title}</Text>
            <Text style={styles.detailMeta}>
              {new Date(article.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.detailPreview}>
              {(() => {
                const idx = article.body.indexOf('.');
                return idx > 0 ? article.body.slice(0, idx + 1) : article.body;
              })()}
            </Text>
          </LinearGradient>

          {!sheetOpened && (
            <Animated.View style={[styles.swipeUpContainer, bounceStyle]}>
              <Ionicons name="chevron-up" size={32} color="#fff" />
              <Text style={styles.swipeText}>Scroll to Continue Reading</Text>
            </Animated.View>
          )}

          <Animated.ScrollView
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: IMAGE_HEIGHT }}
          >
            <PanGestureHandler onGestureEvent={panHandler}>
              <Animated.View style={[styles.detailBodyContainer, sheetStyle]}>
                <View style={styles.dragHandle} />
                <ScrollView
                  contentContainerStyle={{ padding: 16 }}
                  scrollEnabled={sheetOpened}
                >
                  <View style={styles.sheetHeaderRow}>
                    <Text style={styles.sheetTitle}>{article.title}</Text>
                  </View>
                  <Text style={styles.sheetMeta}>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </Text>
                  <Separator marginVertical={12} color="#000" />
                  <Text style={styles.detailBody}>{article.body}</Text>
                </ScrollView>
              </Animated.View>
            </PanGestureHandler>
          </Animated.ScrollView>
        </View>
      </View>
    );
  }

  // List view
  if (listLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }
  if (listError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Error loading articles.</Text>
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.headerName}>
          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Explore Articles</Text>
        </View>
        <FlatList
          data={sortedArticles}
          keyExtractor={(item: ArticleFE) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No articles available.</Text>
            </View>
          )}
          renderItem={({ item }: { item: ArticleFE }) => (
            <TouchableOpacity
              style={styles.rowCard}
              onPress={() => setSelectedId(item.id)}
            >
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.rowThumbnail}
                />
              )}
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
