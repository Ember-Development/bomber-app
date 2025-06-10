// app/side/history.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
  SafeAreaView,
  Animated,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GlobalColors } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TIMELINE_EVENTS = [
  {
    year: '2001',
    title: 'The Beginning',
    description:
      'The Bomber Fastpitch program was established in 2001 with a 10U All-Star team based out of New Braunfels, TX. Eight years later in 2009, we had grown to 8 teams and saw our first two seniors commit to play college softball.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers1.jpeg',
  },
  {
    year: '2011',
    title: 'National Expansion & Depth',
    description:
      'In 2011, the program expanded to 15 teams, adding players and squads from North, South, and East Texas. We began rising in rankings and finishing at national tournaments.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers2.jpg',
  },
  {
    year: '2012-13',
    title: 'From Texas to National',
    description:
      'In 2012-14 we added our first non-Texas team from Louisiana followed by Arizona. By 2013 our program had grown to 30 teams with additions from Arkansas, Oklahoma, Mississippi and Colorado.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/IMG_7949.jpg',
  },
  {
    year: '2014',
    title: 'Training Facility Opens',
    description:
      'We opened our first training facility in 2014 and added staff to enhance recruiting and player development. This transformed the program into a top-ranked national powerhouse.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers3.jpeg',
  },
  {
    year: '2017',
    title: 'Growth + Consistency + Success',
    description:
      'By 2017, our program ranked in the top 10 nationally with over 70 teams in 12 states and our 600th senior committed to play college softball.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/bombers4-300x168.jpg',
  },
  {
    year: '2021',
    title: '20 Years of Excellence',
    description:
      '2021 marked our 20th anniversary: 162 teams in 28 states, 1944 Bomber players, 405 Bomber coaches, and our 1000th player committed to college. Our 18U National ranked #1, 16U National #3, 14U National #2. We lead in analytics and data metrics to boost performance.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/20th_300DPI-1-300x210.png',
  },
];

export default function HistoryScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const animScale = useRef(new Animated.Value(1)).current;
  const textColor = useThemeColor({}, 'text');
  const scrollRef = useRef<import('react-native').ScrollView | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animScale, {
          toValue: 1.08,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const page = Math.round(offsetY / SCREEN_HEIGHT);
    setCurrentIndex(page);
  };

  const scrollToPrevious = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    scrollRef.current?.scrollTo({
      y: prevIndex * SCREEN_HEIGHT,
      animated: true,
    });
    setCurrentIndex(prevIndex);
  };
  const scrollToNext = () => {
    const nextIndex = Math.min(currentIndex + 1, TIMELINE_EVENTS.length - 1);
    scrollRef.current?.scrollTo({
      y: nextIndex * SCREEN_HEIGHT,
      animated: true,
    });
    setCurrentIndex(nextIndex);
  };

  return (
    <BackgroundWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={GlobalColors.bomber} />
        </TouchableOpacity>
        <Animated.ScrollView
          ref={scrollRef}
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={SCREEN_HEIGHT}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {TIMELINE_EVENTS.map((event, index) => {
            const inputRange = [
              (index - 1) * SCREEN_HEIGHT,
              index * SCREEN_HEIGHT,
              (index + 1) * SCREEN_HEIGHT,
            ];
            const translateY = scrollY.interpolate({
              inputRange,
              outputRange: [-SCREEN_HEIGHT * 0.1, 0, SCREEN_HEIGHT * 0.1],
              extrapolate: 'clamp',
            });

            const imageStyle = {
              transform: [{ scale: animScale }, { translateY }],
            };

            return (
              <View key={index} style={styles.pageContainer}>
                <Animated.Image
                  source={{ uri: event.imageUri }}
                  style={[styles.fullImage, imageStyle]}
                  resizeMode="cover"
                />
                <View style={styles.overlay} />

                <View style={styles.gradientContainer}>
                  <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
                    style={styles.gradient}
                  >
                    <View style={styles.gradientContent}>
                      <ThemedText
                        type="subtitle"
                        style={[styles.yearCentered, { color: textColor }]}
                      >
                        {event.year}
                      </ThemedText>
                      <ThemedText
                        type="title"
                        style={[styles.titleCentered, { color: textColor }]}
                      >
                        {event.title}
                      </ThemedText>
                      <ThemedText
                        type="default"
                        style={[styles.descCentered, { color: textColor }]}
                      >
                        {event.description}
                      </ThemedText>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            );
          })}
        </Animated.ScrollView>

        <View style={styles.indicatorContainer}>
          {TIMELINE_EVENTS.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.indicatorDot,
                idx === currentIndex && styles.indicatorDotActive,
              ]}
            />
          ))}
          <ThemedText
            type="subtitle"
            style={[styles.indicatorYearText, { color: textColor }]}
          >
            {TIMELINE_EVENTS[currentIndex]?.year}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.floatingButton, styles.topButton]}
          onPress={scrollToPrevious}
        >
          <Ionicons
            name="arrow-up-circle"
            size={48}
            color={GlobalColors.bomber}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingButton, styles.bottomButton]}
          onPress={scrollToNext}
        >
          <Ionicons
            name="arrow-down-circle"
            size={48}
            color={GlobalColors.bomber}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {},
  pageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  fullImage: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_HEIGHT * 1.2,
    left: -((SCREEN_WIDTH * 1.2 - SCREEN_WIDTH) / 2),
    top: -((SCREEN_HEIGHT * 1.2 - SCREEN_HEIGHT) / 2),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  gradientContainer: {
    position: 'absolute',
    top: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.45,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  gradientContent: {
    marginTop: 20,

    paddingHorizontal: 20,
  },
  yearCentered: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleCentered: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  descCentered: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },

  floatingButton: {
    position: 'absolute',
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 28,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  topButton: {
    bottom: 120,
  },
  bottomButton: {
    bottom: 40,
  },

  indicatorContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.05,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorDotActive: {
    backgroundColor: '#fff',
  },
  indicatorYearText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  backButton: {
    position: 'absolute',
    top: 86,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    padding: 4,
  },
});
