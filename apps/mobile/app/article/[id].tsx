import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
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

  // Refs (optional for future simultaneous handlers)
  const panRef = useRef(null);
  const innerScrollRef = useRef<ScrollView>(null);

  // Bottom sheet state & animations
  const sheetTranslate = useSharedValue(IMAGE_HEIGHT);
  const [sheetOpened, setSheetOpened] = useState(false);
  const bounce = useSharedValue(0);

  useEffect(() => {
    // bounce arrow gently
    bounce.value = withRepeat(
      withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  // Parallax image offset
  const imageOffsetStyle = useAnimatedStyle(() => {
    const delta = IMAGE_HEIGHT - sheetTranslate.value;
    const extra = delta - SHEET_HEIGHT;
    return { transform: [{ translateY: extra > 0 ? -extra : 0 }] };
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

  // Open the sheet the first time user scrolls (helps Android)
  const scrollHandler = useAnimatedScrollHandler((evt) => {
    if (!sheetOpened && evt.contentOffset.y > 50) {
      runOnJS(openSheet)();
    }
  });

  // Drag the sheet — only from the small handle area
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
      else {
        sheetTranslate.value = withTiming(IMAGE_HEIGHT - SHEET_HEIGHT, {
          duration: 300,
        });
      }
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
      {/* Parallax header image */}
      <View style={styles.imageWrapper}>
        <Animated.Image
          source={{ uri: article.imageUrl! }}
          style={[styles.detailImage, imageOffsetStyle]}
        />

        {/* Back button */}
        <TouchableOpacity
          style={styles.detailBack}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Header gradient + title/preview */}
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

        {/* Outer scroll (just to detect first pull; sheet does the real scroll) */}
        <Animated.ScrollView
          onScroll={scrollHandler}
          onScrollBeginDrag={() => {
            if (!sheetOpened) openSheet();
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: IMAGE_HEIGHT }}
          nestedScrollEnabled
        >
          <Animated.View style={[styles.detailBodyContainer, sheetStyle]}>
            {/* Drag handle area only captures the pan */}
            <PanGestureHandler ref={panRef} onGestureEvent={panHandler}>
              <View
                style={{
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={styles.dragHandle} />
              </View>
            </PanGestureHandler>

            {/* Inner scrollable article content */}
            <ScrollView
              ref={innerScrollRef}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
              bounces={false}
              overScrollMode="never"
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
        </Animated.ScrollView>

        {/* Tap-to-open helper */}
        {!sheetOpened && (
          <Animated.View style={[styles.swipeUpContainer, bounceStyle]}>
            <TouchableOpacity
              onPress={openSheet}
              activeOpacity={0.7}
              style={{ alignItems: 'center' }}
            >
              <Ionicons name="chevron-up" size={32} color="#fff" />
              <Text style={styles.swipeText}>Scroll to Continue Reading</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
