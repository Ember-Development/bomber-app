// app/side/commitments.tsx

import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ROW_HORIZONTAL_PADDING = 16;
const ROW_HEIGHT = 100;

interface Commitment {
  id: string;
  player: string;
  college: string;
  collegeLogo: string;
  commitDate: string; // “YYYY-MM-DD”
  position: string;
  hometown: string;
}

// ───────  Mock data ─────────────────────────────────────────────────────────
const COMMITMENTS_DATA: Commitment[] = [
  {
    id: 'c1',
    player: 'Emma Johnson',
    college: 'University of Texas',
    collegeLogo:
      'https://sportslogohistory.com/wp-content/uploads/2021/06/texas_longhorns_2019-pres.png',
    commitDate: '2025-03-15',
    position: 'SS • 2B',
    hometown: 'Austin, TX',
  },
  {
    id: 'c2',
    player: 'Madison Rivera',
    college: 'Oklahoma State University',
    collegeLogo:
      'https://upload.wikimedia.org/wikipedia/commons/8/8d/Osu_pistols_firing_logo.png',
    commitDate: '2025-04-02',
    position: 'P',
    hometown: 'Oklahoma City, OK',
  },
  {
    id: 'c3',
    player: 'Olivia Martinez',
    college: 'Texas A&M University',
    collegeLogo:
      'https://upload.wikimedia.org/wikipedia/commons/6/60/Texas_A%26M_Aggies_Primary_Logo_%282021-Present%29.png',
    commitDate: '2025-02-28',
    position: 'OF',
    hometown: 'College Station, TX',
  },
  {
    id: 'c4',
    player: 'Abby Thompson',
    college: 'UCLA',
    collegeLogo:
      'https://upload.wikimedia.org/wikipedia/commons/a/a7/UCLA_Bruins_logo.svg',
    commitDate: '2025-03-22',
    position: 'C',
    hometown: 'Los Angeles, CA',
  },
  {
    id: 'c5',
    player: 'Samantha Lee',
    college: 'University of Florida',
    collegeLogo:
      'https://upload.wikimedia.org/wikipedia/commons/3/3c/Florida_Gators_script_logo.svg',
    commitDate: '2025-04-10',
    position: '1B',
    hometown: 'Gainesville, FL',
  },
  {
    id: 'c6',
    player: 'Kayla Nguyen',
    college: 'Louisiana State University',
    collegeLogo:
      'https://upload.wikimedia.org/wikipedia/commons/8/86/LSU_Tigers_logo.svg',
    commitDate: '2025-03-30',
    position: 'INF',
    hometown: 'Baton Rouge, LA',
  },
];

// Filter to show only “currentYear” commits
const currentYear = new Date().getFullYear().toString();
const YEARLY_COMMITS = COMMITMENTS_DATA.filter((c) =>
  c.commitDate.startsWith(currentYear)
);

// ───────  CommitmentsScreen ─────────────────────────────────────────────────
export default function CommitmentsScreen() {
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  // Scroll to top
  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Toggle floating button once scrolled past 100px
  const onScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = e.nativeEvent.contentOffset.y;
    if (yOffset > 100 && !showScrollButton) {
      setShowScrollButton(true);
    } else if (yOffset <= 100 && showScrollButton) {
      setShowScrollButton(false);
    }
  };

  // Format commit date nicely: “Mar 15, 2025”
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render each row
  const renderRow = ({ item }: { item: Commitment }) => {
    const formattedDate = formatDate(item.commitDate);

    return (
      <View style={styles.rowWrapper}>
        <BlurView intensity={30} tint="light" style={styles.rowBlur}>
          <View style={styles.rowContent}>
            {/* College Logo */}
            <Image source={{ uri: item.collegeLogo }} style={styles.logo} />

            {/* Text Content */}
            <View style={styles.textContainer}>
              <ThemedText
                type="subtitle"
                style={[styles.playerText, { color: textColor }]}
              >
                {item.player} — {item.college}
              </ThemedText>
              <ThemedText
                type="default"
                style={[styles.detailText, { color: textColor }]}
              >
                {item.position} • {item.hometown} • Committed {formattedDate}
              </ThemedText>
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* HEADER: “2025 Commitments” */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
          <ThemedText style={[styles.headerText, { color: textColor }]}>
            {currentYear} Commitments
          </ThemedText>
        </View>

        {/* If no commits for the year, show a message */}
        {YEARLY_COMMITS.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText
              type="default"
              style={[styles.emptyText, { color: textColor }]}
            >
              No commitments yet for {currentYear}.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={YEARLY_COMMITS}
            numColumns={1}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderRow}
            onScroll={onScrollHandler}
            scrollEventThrottle={16}
          />
        )}

        {/* FLOATING SCROLL‐TO‐TOP BUTTON */}
        {showScrollButton && (
          <TouchableOpacity
            style={styles.floatingContainer}
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <View style={styles.floatingMask}>
              <BlurView intensity={50} tint="light" style={styles.floatingBlur}>
                <Ionicons name="arrow-up" size={24} color="#fff" />
              </BlurView>
            </View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },

  // HEADER
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    paddingTop: 20,
  },

  // When there are no commits for the year
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },

  // FlatList padding
  listContent: {
    paddingHorizontal: ROW_HORIZONTAL_PADDING,
    paddingVertical: 12,
  },

  // Each “row” wrapper
  rowWrapper: {
    marginBottom: 16,
    height: ROW_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // elevation for Android
    elevation: 4,
  },
  rowBlur: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)', // fallback if blur isn’t available
    justifyContent: 'center',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  // College logo (circular)
  logo: {
    width: ROW_HEIGHT * 0.6,
    height: ROW_HEIGHT * 0.6,
    borderRadius: (ROW_HEIGHT * 0.6) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)', // placeholder background
    marginRight: 12,
  },

  // Text container
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  playerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 12,
    marginTop: 4,
    color: '#ccc',
  },

  // Floating “circle” scroll-to-top button
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  floatingMask: {
    flex: 1,
    borderRadius: 26,
    overflow: 'hidden',
  },
  floatingBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
