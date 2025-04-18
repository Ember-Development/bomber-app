import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

interface EventCardProps {
  events: {
    date: string;
    title: string;
    location: string;
    time: string;
  }[];
}

// const eventData: Event = {
//   date: '2025-05-12T19:00:00',
//   title: 'Texas Bombers 16U - Hitting Practice',
//   location: 'Bomber Lab Facility',
//   time: '7:00 PM - 8:30 PM',
// };

export default function EventCardContainer({ events }: EventCardProps) {
  const [selectedTab, setSelectedTab] = useState<'Upcoming' | 'Past'>(
    'Upcoming'
  );
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [countdown, setCountdown] = useState('');

  // **Apply Theme Colors**
  const cardBackground = useThemeColor({}, 'component');
  const toggleBackground = useThemeColor({}, 'background');
  const activeIndicatorColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'component');
  const eventTitleColor = useThemeColor({}, 'buttonText');

  const now = new Date();

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter((e) => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeEvent =
    selectedTab === 'Upcoming' ? upcomingEvents[0] : pastEvents[0];

  useEffect(() => {
    if (!activeEvent) return;

    const updateCountdown = () => {
      const eventTime = new Date(activeEvent.date).getTime();
      const now = new Date().getTime();
      const diff = eventTime - now;

      if (diff <= 0) {
        setCountdown('Event Started');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeEvent]);

  const toggleTab = (tab: 'Upcoming' | 'Past') => {
    setSelectedTab(tab);
    Animated.timing(animatedValue, {
      toValue: tab === 'Upcoming' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const slideStyle = {
    left: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '50%'],
    }),
  };

  return (
    <View style={[styles.eventCard, { backgroundColor: cardBackground }]}>
      <View
        style={[styles.toggleContainer, { backgroundColor: toggleBackground }]}
      >
        <Animated.View
          style={[
            styles.activeIndicator,
            slideStyle,
            { backgroundColor: secondaryColor },
          ]}
        />
        <Pressable style={styles.tab} onPress={() => toggleTab('Upcoming')}>
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === 'Upcoming' && styles.activeText,
            ]}
          >
            Upcoming
          </ThemedText>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => toggleTab('Past')}>
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === 'Past' && styles.activeText,
            ]}
          >
            Past
          </ThemedText>
        </Pressable>
      </View>

      {activeEvent && (
        <View style={styles.dateContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="ticket-outline" size={20} color={textColor} />
            <ThemedText
              type="subtitle"
              style={[styles.titleText, { color: textColor }]}
            >
              {activeEvent.date.split('T')[0]}
            </ThemedText>
          </View>
          {selectedTab === 'Upcoming' && (
            <ThemedText style={styles.countdownText}>{countdown}</ThemedText>
          )}
        </View>
      )}
      <View style={styles.detailContainer}>
        {activeEvent ? (
          <>
            <ThemedText
              type="title"
              style={[styles.eventTitle, { color: eventTitleColor }]}
            >
              {activeEvent.title}
            </ThemedText>
            <ThemedText style={[styles.eventText, { color: eventTitleColor }]}>
              {activeEvent.location}
            </ThemedText>
            <ThemedText style={[styles.eventText, { color: eventTitleColor }]}>
              {activeEvent.time}
            </ThemedText>
          </>
        ) : (
          <ThemedText
            style={[
              styles.eventText,
              { color: eventTitleColor, fontStyle: 'italic' },
            ]}
          >
            No {selectedTab.toLowerCase()} events available
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    height: 40,
    marginBottom: 12,
    paddingRight: 4,
    paddingBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: GlobalColors.blue,
  },
  activeIndicator: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 12,
    marginTop: 2,
    marginRight: 2,
    marginLeft: 2,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeText: {
    fontWeight: 'bold',
  },
  detailContainer: {
    marginTop: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: GlobalColors.dark,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventText: {
    fontSize: 14,
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
});
