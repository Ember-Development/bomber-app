// src/screens/articles/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useArticleById } from '@/hooks/media/useArticle';
import {
  createArticleScreenStyles,
  IMAGE_HEIGHT,
  SHEET_HEIGHT,
} from '@/styles/articlescreenStyle';
import Separator from '@/components/ui/atoms/Seperator';
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
import { LinearGradient } from 'expo-linear-gradient';

export default function ArticleDetailScreen() {
  const styles = createArticleScreenStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<'id'>();
  const { data: article, isLoading, error } = useArticleById(id || '');

  // Bottom sheet state & animations (same as in ArticlesScreen)
  const sheetTranslate = useSharedValue(IMAGE_HEIGHT);
  const [sheetOpened, setSheetOpened] = useState(false);
  const bounce = useSharedValue(0);

  useEffect(() => {
    // arrow bounce
    bounce.value = withRepeat(
      withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  // Parallax image
  const imageOffsetStyle = useAnimatedStyle(() => {
    const delta = IMAGE_HEIGHT - sheetTranslate.value;
    const extra = delta - SHEET_HEIGHT;
    return { transform: [{ translateY: extra > 0 ? -extra : 0 }] };
  });

  // Open / close handlers
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

  // Gesture & scroll handlers
  const scrollHandler = useAnimatedScrollHandler((evt) => {
    if (!sheetOpened && evt.contentOffset.y > 50) {
      runOnJS(openSheet)();
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

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.emptyContainer}>
          <ActivityIndicator color="#fff" />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }
  if (error || !article) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Unable to load article.</Text>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <View style={styles.detailContainer}>
      {/* Parallax image + back button */}
      <View style={styles.imageWrapper}>
        <Animated.Image
          source={{ uri: article.imageUrl! }}
          style={[styles.detailImage, imageOffsetStyle]}
        />
        <TouchableOpacity
          style={styles.detailBack}
          onPress={() => router.back()}
        >
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

        {/* Header overlay */}
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
                  <Text style={styles.sheetMeta}>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Separator marginVertical={12} color="#000" />
                <Text style={styles.detailBody}>{article.body}</Text>
              </ScrollView>
            </Animated.View>
          </PanGestureHandler>
        </Animated.ScrollView>

        {/* Arrow bounce */}
        {!sheetOpened && (
          <Animated.View style={[styles.swipeUpContainer, bounceStyle]}>
            <Ionicons name="chevron-up" size={32} color="#fff" />
            <Text style={styles.swipeText}>Scroll to Continue Reading</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
