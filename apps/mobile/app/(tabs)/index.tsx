import {
  SafeAreaView,
  Animated,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRef } from 'react';
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

import { useUserContext } from '@/context/useUserContext';
import { useUserEvents, useUserChats } from '@/hooks/useUser';
import { formatEvents } from '@/utils/FormatEvents';
import { legacyItems, mockArticles, mockVideos } from '@/constants/items';
import { createHomeStyles } from '@/styles/homeStyle';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { GlobalColors } from '@/constants/Colors';

const QUICK_ACTIONS = [
  {
    title: 'Payments',
    icon: require('@/assets/images/react-logo.png'),
    onPress: () => alert('Payments Clicked!'),
  },
  {
    title: 'My Teams',
    icon: require('@/assets/images/react-logo.png'),
    onPress: () => alert('My Teams Clicked!'),
  },
];

export default function HomeScreen() {
  const { user, refetch } = useUserContext();
  const { data: rawEvents, isLoading: isEventsLoading } = useUserEvents(
    user?.id
  );
  const { data: userChats, isLoading: isChatsLoading } = useUserChats(user?.id);
  const styles = createHomeStyles();
  const router = useRouter();

  const handlePaymentPress = () => alert('Payment Reroute Clicked');
  const handleTeamsPress = () => alert('Teams Reroute Clicked');
  const seeAllEvents = () => alert('See All Events Clicked');
  const seeAllGroups = () => alert('See All Groups Clicked');
  const seeAllMedia = () => alert('See All Media Clicked');

  const formattedEvents = formatEvents(rawEvents ?? []);

  const scrollY = useRef(new Animated.Value(0)).current;

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

  if (!user || isEventsLoading || isChatsLoading || !user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ActivityIndicator size="large" />
        <ThemedText type="title">Loading...</ThemedText>
      </SafeAreaView>
    );
  }

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
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          overScrollMode="never"
        >
          <Animated.View
            style={[
              styles.titleContainer,
              {
                zIndex: 10,
                height: headerHeight,
                transform: [{ scale: headerScale }],
              },
            ]}
          >
            <View style={styles.title}>
              <View style={styles.titleText}>
                <ThemedText type="defaultSemiBold">Welcome Back,</ThemedText>
                <ThemedText type="title">
                  {user?.fname} {user?.lname}
                </ThemedText>
              </View>
              <UserAvatar firstName={user?.fname} lastName={user?.lname} />
            </View>
          </Animated.View>

          <View style={styles.quickAction}>
            <View style={styles.myActions}>
              {QUICK_ACTIONS.map((item) => (
                <Card key={item.title} type="quickAction" {...item} />
              ))}
            </View>
            <View style={styles.notifications}>
              <NotificationCard />
            </View>
          </View>

          <View style={styles.event}>
            <View style={styles.EventText}>
              <ThemedText type="title">Events</ThemedText>
              <CustomButton
                title="See All"
                variant="text"
                onPress={seeAllEvents}
                fullWidth={false}
              />
            </View>
            <EventCardContainer events={formattedEvents} />
          </View>

          <Animated.View style={styles.groups}>
            <View style={styles.EventText}>
              <ThemedText type="title">Groups</ThemedText>
              <CustomButton
                title="See All"
                variant="text"
                onPress={seeAllGroups}
                fullWidth={false}
              />
            </View>

            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 5 }}
              decelerationRate={0.8}
              snapToAlignment="start"
              snapToInterval={230}
              bounces={false}
              overScrollMode="never"
            >
              {userChats?.map((chat) => (
                <Card
                  key={chat.id}
                  type="groupChat"
                  title={chat.title}
                  additionalInfo={`${chat.users.length} Members`}
                  onPress={() => {
                    router.push({
                      pathname: '/groups/[id]',
                      params: { id: chat.id.toString() },
                    });
                  }}
                />
              ))}
            </Animated.ScrollView>
          </Animated.View>

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
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={GlobalColors.bomber}
                      />
                    </View>
                    <ThemedText type="default">{item.title}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.mediaSection}>
            <View style={styles.EventText}>
              <ThemedText type="title">Media</ThemedText>
              <CustomButton
                title="See All"
                variant="text"
                onPress={seeAllMedia}
                fullWidth={false}
              />
            </View>

            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 5 }}
              decelerationRate={0.8}
              snapToAlignment="start"
              snapToInterval={200}
              bounces={false}
              overScrollMode="never"
            >
              {mockArticles.map((item, idx) => (
                <ArticleCard key={`article-${idx}`} {...item} />
              ))}
              {mockVideos.map((item, idx) => (
                <VideoCard key={`video-${idx}`} {...item} />
              ))}
            </Animated.ScrollView>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
