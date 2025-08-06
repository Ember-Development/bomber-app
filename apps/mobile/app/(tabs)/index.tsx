// src/screens/HomeScreen.tsx
import {
  SafeAreaView,
  Animated as RNAnimated,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import BannerModal, { BannerData } from '@/components/ui/organisms/Banner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import Card from '@/components/ui/molecules/Card';
import NotificationCard from '@/components/ui/molecules/NotificationCard';
import UserAvatar from '@/components/ui/organisms/Sidemenu';
import CustomButton from '@/components/ui/atoms/Button';
import EventCardContainer from '@/components/ui/molecules/EventCard/SpotlightEvent/SpotlightContainer';
import ArticleCard from '@/components/ui/molecules/ArticleCard';
import VideoCard from '@/components/ui/molecules/MediaCards';
import becomeBomberImage from '@/assets/images/bomberimage1.jpg';

import { useAllMedia } from '@/hooks/media/useMedia';
import FeaturedVideoCard from '@/components/ui/molecules/featuredVideoCard';
import CategoryCard from '@/components/ui/molecules/CategoryCard';
import { CATEGORY_ITEM_WIDTH, CARD_MARGIN } from '@/styles/videoscreenStyle';

import { useUserContext } from '@/context/useUserContext';
import { useUserEvents, useUserChats } from '@/hooks/useUser';
import { formatEvents } from '@/utils/FormatEvents';
import { legacyItems } from '@/constants/items';
import { createHomeStyles } from '@/styles/homeStyle';
import { GlobalColors } from '@/constants/Colors';
import { QuickAction, quickActionMap } from '@/constants/quickActions';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useBanners } from '@/hooks/banner/useBanner';

import Reanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useAllArticles } from '@/hooks/media/useArticle';

export default function HomeScreen() {
  const { user } = useUserContext();
  const router = useRouter();
  const styles = createHomeStyles();

  // Header stretch/shrink using RN Animated
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [100, 70],
    extrapolate: 'clamp',
  });
  const headerScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // User data & roles
  const primaryRole = Array.isArray(user?.primaryRole)
    ? user.primaryRole[0]
    : (user?.primaryRole ?? '');
  const isFan = primaryRole.toUpperCase() === 'FAN';

  const roles = primaryRole ? [primaryRole] : [];
  const actionsToShow: QuickAction[] = Array.from(
    new Map(
      roles
        .flatMap(
          (role) => quickActionMap[role as keyof typeof quickActionMap] || []
        )
        .map((action) => [action.title, action] as [string, QuickAction])
    ).values()
  );

  // Data fetching
  const { data: rawEvents, isLoading: isEventsLoading } = useUserEvents(
    user?.id
  );
  const { data: userChats, isLoading: isChatsLoading } = useUserChats(user?.id);
  const { data: banners, isLoading: bannersLoading } = useBanners();
  const { data: videos, isLoading: isMediaLoading } = useAllMedia();
  const { data: articles = [], isLoading: isArticlesLoading } =
    useAllArticles();

  const sortedArticles = useMemo(() => {
    return [...articles].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [articles]);
  const topThree = sortedArticles.slice(0, 3);
  const formattedEvents = formatEvents(rawEvents ?? []);

  // Banner logic
  const [showBanner, setShowBanner] = useState(true);
  const [currentBanner, setCurrentBanner] = useState<BannerData | null>(null);
  useEffect(() => {
    (async () => {
      if (bannersLoading || !banners) return;
      const now = new Date();
      const active = banners.find((b) => new Date(b.expiresAt) > now);
      if (!active) return;
      const seenJson = await AsyncStorage.getItem('seenBanners');
      const seen: string[] = seenJson ? JSON.parse(seenJson) : [];
      if (!seen.includes(active.id)) {
        setCurrentBanner({
          id: active.id,
          imageUrl: active.imageUrl,
          duration: active.duration,
          expiresAt: new Date(active.expiresAt),
        });
        setShowBanner(true);
      }
    })();
  }, [banners, bannersLoading]);
  const handleCloseBanner = async () => {
    if (!currentBanner) return;
    const seenJson = await AsyncStorage.getItem('seenBanners');
    const seen: string[] = seenJson ? JSON.parse(seenJson) : [];
    if (!seen.includes(currentBanner.id)) {
      seen.push(currentBanner.id);
      await AsyncStorage.setItem('seenBanners', JSON.stringify(seen));
    }
    setShowBanner(false);
  };

  // Hero + mini‐carousel setup
  const sortedVideos = useMemo(
    () =>
      (videos ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [videos]
  );
  const hero = sortedVideos[0] ?? null;
  const miniList = sortedVideos.slice(1, 4);

  // Reanimated for mini‐carousel
  const scrollX = useSharedValue(0);
  const onMiniScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  if (!user || isEventsLoading || isChatsLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ActivityIndicator size="large" />
        <ThemedText type="title">Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  const handleSeeAllMedia = () => {
    router.push('/side/videos');
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        {currentBanner && showBanner && (
          <BannerModal
            visible={showBanner}
            data={currentBanner}
            onClose={handleCloseBanner}
          />
        )}

        {/* Main scroll with RN Animated */}
        <RNAnimated.ScrollView
          contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
          onScroll={RNAnimated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <RNAnimated.View
            style={[
              styles.titleContainer,
              { height: headerHeight, transform: [{ scale: headerScale }] },
            ]}
          >
            <View style={styles.title}>
              <View style={styles.titleText}>
                <ThemedText type="defaultSemiBold">Welcome Back,</ThemedText>
                <ThemedText type="title">
                  {user.fname} {user.lname}
                </ThemedText>
              </View>
              <UserAvatar
                firstName={user.fname}
                lastName={user.lname}
                primaryRole={primaryRole}
              />
            </View>
          </RNAnimated.View>

          {/* Quick Actions & Notifications */}
          <View style={styles.quickAction}>
            <View style={styles.myActions}>
              {actionsToShow.map((item) => (
                <Card key={item.title} type="quickAction" {...item} />
              ))}
            </View>
            <View style={styles.notifications}>
              <NotificationCard />
            </View>
          </View>

          {/* Events */}
          {!isFan && (
            <View style={styles.event}>
              <View style={styles.EventText}>
                <ThemedText type="title">Events</ThemedText>
                <CustomButton
                  title="See All"
                  variant="text"
                  onPress={() => {}}
                  fullWidth={false}
                />
              </View>
              <EventCardContainer events={formattedEvents} />
            </View>
          )}

          {/* Groups — hidden for Fans */}
          {/* {!isFan && (
            <Animated.View style={styles.groups}>
              <View style={styles.EventText}>
                <ThemedText type="title">Groups</ThemedText>
                <CustomButton
                  title="See All"
                  variant="text"
                  onPress={handleSeeAllGroups}
                  fullWidth={false}
                />
              </View>
              <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 5,
                  paddingBottom: 5,
                }}
                decelerationRate="fast"
                snapToAlignment="start"
                snapToInterval={230}
                bounces={false}
              >
                {userChats?.map((chat) => (
                  <Card
                    key={chat.id}
                    type="groupChat"
                    title={chat.title}
                    additionalInfo={`${chat.users.length} Members`}
                    onPress={() =>
                      router.push({
                        pathname: '/groups/[id]',
                        params: { id: chat.id.toString() },
                      })
                    }
                  />
                ))}
              </Animated.ScrollView>
            </Animated.View>
          )} */}

          {/* Media Section: Hero + Mini‐Carousel */}
          <View style={styles.mediaSection}>
            <View style={styles.EventText}>
              <ThemedText type="title">Media</ThemedText>
              <CustomButton
                title="See All"
                variant="text"
                onPress={handleSeeAllMedia}
                fullWidth={false}
              />
            </View>

            {isMediaLoading ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : (
              <>
                {/* Hero video */}
                {hero && (
                  <View style={{ marginBottom: 16 }}>
                    <FeaturedVideoCard
                      video={hero}
                      onPress={() =>
                        router.push({
                          pathname: '../video/[id]',
                          params: { id: hero.id },
                        })
                      }
                    />
                  </View>
                )}

                {/* Mini‐carousel */}
                <Reanimated.ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CATEGORY_ITEM_WIDTH + CARD_MARGIN}
                  decelerationRate="fast"
                  onScroll={onMiniScroll}
                  scrollEventThrottle={16}
                  contentContainerStyle={{
                    paddingHorizontal: 0,
                  }}
                >
                  {miniList.map((vid, idx) => (
                    <CategoryCard
                      key={vid.id}
                      item={vid}
                      index={idx}
                      scrollX={scrollX}
                      onPress={() =>
                        router.push({
                          pathname: '../video/[id]',
                          params: { id: vid.id },
                        })
                      }
                    />
                  ))}
                </Reanimated.ScrollView>
              </>
            )}
          </View>

          <View
            style={
              styles.mediaSection /* you can add a new style like styles.articlesSection */
            }
          >
            <View style={styles.EventText}>
              <ThemedText type="title">Articles</ThemedText>
              <CustomButton
                title="See All"
                variant="text"
                onPress={() => router.push('/side/articles')}
                fullWidth={false}
              />
            </View>

            {isArticlesLoading ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : (
              <Reanimated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={176} // card width (160 + margin)
                bounces={false}
              >
                {topThree.map((item) => (
                  <ArticleCard
                    key={item.id}
                    image={{ uri: item.imageUrl || '' }}
                    title={item.title}
                    onPress={() =>
                      router.push({
                        pathname: '../article/[id]',
                        params: { id: item.id },
                      })
                    }
                  />
                ))}
              </Reanimated.ScrollView>
            )}
          </View>

          {/* Legacy & other sections... */}
          <View style={styles.legacy}>
            <View style={styles.legacyText}>
              <ThemedText type="title">Bombers Legacy</ThemedText>
              <ThemedText type="defaultSemiBold">
                See how the Bombers program has built champions.
              </ThemedText>
            </View>
            <View style={styles.legacyList}>
              {legacyItems.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={styles.legacyCard}
                  onPress={() => router.push(item.routes)}
                >
                  <View style={styles.legacyItems}>
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={GlobalColors.bomber}
                    />
                    <ThemedText type="default">{item.title}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {user?.primaryRole === 'FAN' && (
            <View style={styles.becomeBomber}>
              <ThemedText type="title">Become a Bomber</ThemedText>
              <TouchableOpacity
                style={styles.bomberCard}
                onPress={() => router.push('/signup')}
                activeOpacity={0.85}
              >
                <Image
                  source={becomeBomberImage}
                  style={styles.bomberImage}
                  resizeMode="cover"
                />

                {/* Bottom overlay bar */}
                <View style={styles.bomberOverlay}>
                  {/* Bottom fade up into content */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0)']}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Blur effect across the footer */}
                  <BlurView
                    intensity={60}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Top edge softener */}
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'transparent']}
                    style={styles.bomberFadeTop}
                  />
                  {/* Centered Text */}
                  <ThemedText type="title" style={styles.bomberText}>
                    FIND OUT HOW
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </RNAnimated.ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
