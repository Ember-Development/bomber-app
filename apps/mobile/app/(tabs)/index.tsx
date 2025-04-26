import { SafeAreaView, Animated, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { createHomeStyles } from '@/styles/homeStyle';
import Card from '@/components/ui/molecules/Card';
import NotificationCard from '@/components/ui/molecules/NotificationCard';
import UserAvatar from '@/components/ui/organisms/Sidemenu';
import CustomButton from '@/components/ui/atoms/Button';
import EventCardContainer from '@/components/ui/molecules/EventCard/SpotlightEvent/SpotlightContainer';
import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useUserEvents, useUserChats } from '@/hooks/useUser';
import { useRouter } from 'expo-router';
import { UserFE } from '@bomber-app/database';
import { api } from '@/api/api';

export default function HomeScreen() {
  const [user, setUser] = useState<UserFE | null>(null);
  const { data: rawEvents } = useUserEvents(user?.id);
  const { data: userChats } = useUserChats(user?.id);
  const styles = createHomeStyles('light');
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data: fetchedUser } = await api.get('/api/auth/login');
      setUser(fetchedUser);
      console.log('User:', fetchedUser);
    };

    loadUser();
  }, []);

  const formattedEvents =
    rawEvents?.flatMap((e) => {
      if (!e.event?.start || !e.event?.end) return [];

      const start = new Date(e.event.start);
      const end = new Date(e.event.end);
      const time = `${start.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${end.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      return [
        {
          date:
            typeof e.event.start === 'string'
              ? e.event.start
              : e.event.start.toISOString(),
          title: e.event.tournament
            ? `Tournament – ${e.event.tournament.title}`
            : e.event.eventType,
          location: e.event.tournament?.title ?? 'Unknown Location',
          time,
        },
      ];
    }) ?? [];

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

  const legacyItems: { title: string; icon: keyof typeof Ionicons.glyphMap }[] =
    [
      { title: 'Bombers History', icon: 'book-outline' },
      { title: 'Bombers Alumni', icon: 'people-outline' },
      { title: 'Recent Commitments', icon: 'medal-outline' },
    ];

  return (
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
              backgroundColor: '#f6f6f6',
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
            <UserAvatar
              firstName={user?.fname ?? 'First'}
              lastName={user?.lname ?? 'Last'}
            />
          </View>
        </Animated.View>

        {/* Scrollable */}
        <View style={styles.quickAction}>
          <View style={styles.myActions}>
            <Card
              type="quickAction"
              title="Payments"
              icon={require('@/assets/images/react-logo.png')}
              onPress={() => alert('Payments Clicked!')}
            />
            <Card
              type="quickAction"
              title="My Teams"
              icon={require('@/assets/images/react-logo.png')}
              onPress={() => alert('Payments Clicked!')}
            />
          </View>
          <View style={styles.notifications}>
            <NotificationCard />
          </View>
        </View>

        {/* Events */}
        <View style={styles.event}>
          <View style={styles.EventText}>
            <ThemedText type="title">Events</ThemedText>
            <CustomButton
              title="See All"
              variant="text"
              onPress={() => console.log('See All Events')}
              fullWidth={false}
            />
          </View>
          <EventCardContainer events={formattedEvents} />
        </View>

        {/* Groups */}
        <Animated.View style={styles.groups}>
          <View style={styles.EventText}>
            <ThemedText type="title">Groups</ThemedText>
            <CustomButton
              title="See All"
              variant="text"
              onPress={() => console.log('See All Groups')}
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
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon} size={24} color="#000" />
                </View>
                <ThemedText type="default">{item.title}</ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
