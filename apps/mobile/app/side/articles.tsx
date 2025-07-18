// src/screens/ArticlesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { createArticleScreenStyles } from '@/styles/articlescreenStyle';
import Separator from '@/components/ui/atoms/Seperator';
import CustomButton from '@/components/ui/atoms/Button';

const { height } = Dimensions.get('window');
const IMAGE_HEIGHT = height;
const SHEET_HEIGHT = height * 0.5;

interface Article {
  id: string;
  title: string;
  body: string;
  link?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Minimal: Things You Should Know',
    body: 'Minimalism isn’t about having less for the sake of it—it’s about making room for more of what truly matters. When I first adopted a minimalist approach, I discovered that clearing out my physical clutter also created mental space. My mornings became calmer without dozens of shirts vying for attention; even deciding what to eat felt more purposeful without a pantry full of impulse buys. Over time, I applied the same principles to my digital life: unsubscribing from newsletters I never read, deleting unused apps, and organizing my desktop into just three folders. The result was a noticeable drop in anxiety, more sustained focus during work, and evenings free to pursue hobbies rather than staring blankly at a half-empty schedule. Minimalism taught me to question every purchase and commitment: Does this item bring me joy or utility? Does this event align with my priorities? If the answer was “no,” it made identifying and eliminating distractions straightforward. Today, I live in a small, sunlit apartment with only the essentials—each possession earned its place. While minimalism looks different for everyone, its core lesson remains universal: by intentionally reducing the noise, we can amplify what’s truly important.',
    link: undefined,
    imageUrl:
      'https://extrainningsoftballcom.b-cdn.net/wp-content/uploads/Scott-Smith-2-e1650915825329-891x1024.jpeg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'How to Learn and Adapt Faster',
    body: 'Learning quickly is not about working harder; it’s about using the right strategies. In this article, I share my top techniques for rapid skill acquisition, including spaced repetition, the Feynman Technique, and deliberate practice methods that maximize retention...',
    link: undefined,
    imageUrl: 'https://i.ytimg.com/vi/UijdeftJNVc/maxresdefault.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'My Creative Collection of 2021 Design',
    body: 'Every year, I curate a selection of designs that inspire me. From typography to user interfaces, these examples represent the best creative work I encountered in 2021. Dive into my curated galleries and learn what makes these designs stand out...',
    link: undefined,
    imageUrl:
      'https://cdn1.sportngin.com/attachments/photo/ff32-144168738/15U_medium.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ArticlesScreen() {
  const styles = createArticleScreenStyles();
  const [selected, setSelected] = useState<Article | null>(null);
  const [sheetOpened, setSheetOpened] = useState(false);

  const sheetTranslate = useSharedValue(IMAGE_HEIGHT);

  // arrow bounce
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

  const openSheet = () => {
    sheetTranslate.value = withTiming(IMAGE_HEIGHT - SHEET_HEIGHT, {
      duration: 500,
    });
    setSheetOpened(true);
  };

  const closeSheet = () => {
    sheetTranslate.value = withTiming(IMAGE_HEIGHT, { duration: 300 });
    setSheetOpened(false);
    runOnJS(setSelected)(null);
  };

  const scrollHandler = useAnimatedScrollHandler((evt) => {
    if (sheetOpened) return;
    const y = evt.contentOffset.y;
    if (y > 50) {
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
    onActive: (evt, ctx) => {
      const next = ctx.startY + evt.translationY;
      sheetTranslate.value = Math.max(
        IMAGE_HEIGHT - SHEET_HEIGHT,
        Math.min(IMAGE_HEIGHT, next)
      );
    },
    onEnd: (evt) => {
      if (evt.translationY > SHEET_HEIGHT * 0.25) {
        runOnJS(closeSheet)();
      } else {
        sheetTranslate.value = withTiming(IMAGE_HEIGHT - SHEET_HEIGHT, {
          duration: 300,
        });
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslate.value }],
  }));

  if (selected) {
    return (
      <View style={styles.detailContainer}>
        {selected.imageUrl && (
          <Image
            source={{ uri: selected.imageUrl }}
            style={[styles.detailImage, { height: IMAGE_HEIGHT }]}
          />
        )}
        {/* bouncing arrow */}
        {!sheetOpened && (
          <Animated.View style={[styles.swipeUpContainer, bounceStyle]}>
            <Ionicons name="chevron-up" size={32} color="#fff" />
            <Text style={styles.swipeText}>Scroll to Continue Reading</Text>
          </Animated.View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          start={{ x: 0.65, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.detailHeaderOverlay}
        >
          <Text style={styles.detailTitle}>{selected.title}</Text>
          <Text style={styles.detailMeta}>
            {new Date(selected.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.detailPreview}>
            {(() => {
              const idx = selected.body.indexOf('.');
              return idx > 0 ? selected.body.slice(0, idx + 1) : selected.body;
            })()}
          </Text>
        </LinearGradient>

        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: IMAGE_HEIGHT }}
        >
          <PanGestureHandler onGestureEvent={panHandler}>
            <Animated.View style={[styles.detailBodyContainer, sheetStyle]}>
              <ScrollView
                contentContainerStyle={{ padding: 16 }}
                scrollEnabled={sheetOpened}
              >
                <View style={styles.sheetHeaderRow}>
                  <Text style={styles.sheetTitle}>{selected.title}</Text>
                  <CustomButton
                    variant="icon"
                    iconName="close"
                    onPress={closeSheet}
                  />
                </View>
                <Text style={styles.sheetMeta}>
                  {new Date(selected.createdAt).toLocaleDateString()}
                </Text>
                <Separator marginVertical={12} color="#000" />
                <Text style={styles.detailBody}>{selected.body}</Text>
              </ScrollView>
            </Animated.View>
          </PanGestureHandler>
        </Animated.ScrollView>
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.headerName}>
          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => setSelected(null)}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Explore Articles</Text>
        </View>
        <FlatList
          data={mockArticles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.rowCard}
              onPress={() => setSelected(item)}
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
                <Text style={styles.rowMeta}>7 months ago</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
