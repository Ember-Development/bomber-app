import React, { useRef } from 'react';
import {
  SafeAreaView,
  Animated,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

// Components
import { ThemedText } from '@/components/ThemedText';
import Card from '@/components/ui/molecules/Card';
import NotificationCard from '@/components/ui/molecules/NotificationCard';
import UserAvatar from '@/components/ui/organisms/Sidemenu';
import CustomButton from '@/components/ui/atoms/Button';
import EventCardContainer from '@/components/ui/molecules/EventCard/SpotlightEvent/SpotlightContainer';
import ArticleCard from '@/components/ui/molecules/ArticleCard';
import VideoCard from '@/components/ui/molecules/MediaCards';
import becomeBomberImage from '@/assets/images/bomberimage1.jpg';

import { useUserContext } from '@/context/useUserContext';
import { useUserEvents, useUserChats } from '@/hooks/useUser';
import { formatEvents } from '@/utils/FormatEvents';
import { legacyItems, mockArticles, mockVideos } from '@/constants/items';
import { createHomeStyles } from '@/styles/homeStyle';
import { GlobalColors } from '@/constants/Colors';
import { QuickAction, quickActionMap } from '@/constants/quickActions';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user, refetch } = useUserContext();
  const router = useRouter();
  const styles = createHomeStyles();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Ensure primaryRole is a string and normalize
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

  const { data: rawEvents, isLoading: isEventsLoading } = useUserEvents(
    user?.id
  );
  const { data: userChats, isLoading: isChatsLoading } = useUserChats(user?.id);
  const formattedEvents = formatEvents(rawEvents ?? []);

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

  if (!user || isEventsLoading || isChatsLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ActivityIndicator size="large" />
        <ThemedText type="title">Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  const handleSeeAllEvents = () => {
    /* logic */
  };
  const handleSeeAllGroups = () => {
    /* logic */
  };
  const handleSeeAllMedia = () => {
    /* logic */
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                height: headerHeight,
                transform: [{ scale: headerScale }],
              },
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
          </Animated.View>

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

          {/* Events — hidden for Fans */}
          {!isFan && (
            <View style={styles.event}>
              <View style={styles.EventText}>
                <ThemedText type="title">Events</ThemedText>
                <CustomButton
                  title="See All"
                  variant="text"
                  onPress={handleSeeAllEvents}
                  fullWidth={false}
                />
              </View>
              <EventCardContainer events={formattedEvents} />
            </View>
          )}

          {/* Groups — hidden for Fans */}
          {!isFan && (
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
          )}

          {/* Legacy */}
          <View style={styles.legacy}>
            <View style={styles.legacyText}>
              <ThemedText type="title">Bombers Legacy</ThemedText>
              <ThemedText type="defaultSemiBold">
                See how the Bombers program has built champions.
              </ThemedText>
            </View>
            <View style={styles.legacyList}>
              {legacyItems.map((item) => (
                <TouchableOpacity style={styles.legacyCard} key={item.title}>
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

          {/* Media */}
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
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 5 }}
              decelerationRate="fast"
              snapToAlignment="start"
              snapToInterval={200}
              bounces={false}
            >
              {mockArticles.map((item, idx) => (
                <ArticleCard key={`article-${idx}`} {...item} />
              ))}
              {mockVideos.map((item, idx) => (
                <VideoCard key={`video-${idx}`} {...item} />
              ))}
            </Animated.ScrollView>
          </View>

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
        </Animated.ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
