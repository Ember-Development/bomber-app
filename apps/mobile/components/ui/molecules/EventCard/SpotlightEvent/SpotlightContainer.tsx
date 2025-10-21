import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { GlobalColors } from '@/constants/Colors';
import { getCountdown } from '@/utils/FormatEvents';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import ViewEvent from '@/app/events/modals/ViewEvent';

interface EventCardProps {
  events: {
    id: string;
    date: string;
    title: string;
    location: string;
    time: string;
  }[];
}

export default function EventCardContainer({ events }: EventCardProps) {
  const [selectedTab, setSelectedTab] = useState<'Upcoming' | 'Past'>(
    'Upcoming'
  );
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [countdown, setCountdown] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();

  // formatting events
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

      if (!eventTime || isNaN(eventTime)) {
        setCountdown('Invalid Date');
        return;
      }

      setCountdown(getCountdown(diff));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeEvent]);

  // tab toggle
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

  if (!events.length) {
    return <ThemedText style={{ padding: 16 }}>No events available</ThemedText>;
  }

  return (
    <View style={[styles.eventCard]}>
      <View style={[styles.toggleContainer]}>
        <Animated.View style={[styles.activeIndicator, slideStyle]} />
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
            <Ionicons
              name="ticket-outline"
              size={20}
              color={GlobalColors.bomber}
            />
            <ThemedText type="subtitle" style={[styles.titleText]}>
              {activeEvent.date.split('T')[0]}
            </ThemedText>
          </View>
          {selectedTab === 'Upcoming' && (
            <ThemedText style={styles.countdownText}>{countdown}</ThemedText>
          )}
        </View>
      )}
      <Pressable
        style={styles.detailContainer}
        onPress={() => activeEvent && setSelectedEventId(activeEvent.id)}
        disabled={!activeEvent}
      >
        {activeEvent ? (
          <>
            <ThemedText type="title" style={[styles.eventTitle]}>
              {activeEvent.title}
            </ThemedText>
            <ThemedText style={[styles.eventText]}>
              {activeEvent.location}
            </ThemedText>
            <ThemedText style={[styles.eventText]}>
              {activeEvent.time}
            </ThemedText>
          </>
        ) : (
          <ThemedText style={[styles.eventText, { fontStyle: 'italic' }]}>
            No {selectedTab.toLowerCase()} events available
          </ThemedText>
        )}
      </Pressable>

      {/* Event Modal */}
      <FullScreenModal
        isVisible={Boolean(selectedEventId)}
        onClose={() => setSelectedEventId(undefined)}
        title="Event"
      >
        <ViewEvent eventId={selectedEventId} />
      </FullScreenModal>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    height: 40,
    marginBottom: 12,
  },
  activeIndicator: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 0,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  activeText: {
    color: GlobalColors.bomber,
    fontWeight: '700',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#fff',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#66ccff',
  },
  detailContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    borderRadius: 14,
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  eventText: {
    fontSize: 14,
    color: GlobalColors.bomber,
    marginTop: 4,
  },
});
