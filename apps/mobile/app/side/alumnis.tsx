// app/side/alumnis.tsx

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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomSelect from '@/components/ui/atoms/dropdown';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock alumni entries
const ALUMNI_DATA = [
  {
    id: '1',
    name: 'Alyssa Edwards',
    year: '2009',
    school: 'McLennan Community College',
    logoUri: '',
  },
  {
    id: '2',
    name: 'Lily Laney',
    year: '2009',
    school: 'TCU / Texas A&M',
    logoUri:
      'https://upload.wikimedia.org/wikipedia/commons/6/60/Texas_A%26M_Aggies_Primary_Logo_%282021-Present%29.png',
  },
  {
    id: '3',
    name: 'Megan Carter',
    year: '2012',
    school: 'Texas State University',
    logoUri:
      'https://upload.wikimedia.org/wikipedia/en/thumb/f/fb/Texas_State_University_seal.svg/800px-Texas_State_University_seal.svg.png',
  },
  {
    id: '4',
    name: 'Rebecca Jones',
    year: '2014',
    school: 'Baylor University',
    logoUri:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Baylor_Athletics_logo.svg/1698px-Baylor_Athletics_logo.svg.png',
  },
  {
    id: '5',
    name: 'Jessica Martinez',
    year: '2017',
    school: 'University of Texas',
    logoUri:
      'https://sportslogohistory.com/wp-content/uploads/2021/06/texas_longhorns_2019-pres.png',
  },
  {
    id: '6',
    name: 'Sarah Thompson',
    year: '2021',
    school: 'Texas A&M University',
    logoUri:
      'https://upload.wikimedia.org/wikipedia/commons/6/60/Texas_A%26M_Aggies_Primary_Logo_%282021-Present%29.png',
  },
];

// Build distinct year options + “All”
const YEAR_OPTIONS = [
  { label: 'All', value: 'All' },
  ...Array.from(new Set(ALUMNI_DATA.map((a) => a.year)))
    .sort()
    .map((yr) => ({ label: yr, value: yr })),
];

// Each flip card: front shows logo + name/school, back shows achievements
function FlipCard({
  item,
  textColor,
}: {
  item: (typeof ALUMNI_DATA)[0];
  textColor: string;
}) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  // Interpolate rotateY: 0° → 180°
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  // On press, animate flip
  const handleFlip = () => {
    if (isFlipped) {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    } else {
      Animated.timing(flipAnim, {
        toValue: 180,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleFlip}
      style={styles.cardWrapper}
    >
      <BlurView intensity={30} tint="light" style={styles.cardBlur}>
        {/* Perspective container */}
        <Animated.View
          style={[
            styles.flipContainer,
            { transform: [{ perspective: 1000 }, { rotateY }] },
          ]}
        >
          {/* FRONT FACE */}
          <View
            style={[styles.faceContainer, { backfaceVisibility: 'hidden' }]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
              style={styles.cardGradient}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: item.logoUri }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <ThemedText
                type="subtitle"
                style={[styles.alumName, { color: textColor }]}
              >
                {item.name}
              </ThemedText>
              <ThemedText type="default" style={styles.schoolText}>
                {item.school} • {item.year}
              </ThemedText>
            </LinearGradient>
          </View>

          {/* BACK FACE */}
          <View
            style={[
              styles.faceContainer,
              {
                transform: [{ rotateY: '180deg' }],
                backfaceVisibility: 'hidden',
              },
            ]}
          ></View>
        </Animated.View>
      </BlurView>
    </TouchableOpacity>
  );
}

export default function AlumnisScreen() {
  const textColor = useThemeColor({}, 'text');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const listRef = useRef<FlatList<any>>(null);

  // Filter based on selectedYear
  const filteredData =
    selectedYear === 'All'
      ? ALUMNI_DATA
      : ALUMNI_DATA.filter((a) => a.year === selectedYear);

  // Move FlatList to top
  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // “Load More” placeholder
  const handleLoadMore = () => {
    console.log('Load more alumni...');
  };

  // Render each alumni flip card
  const renderAlumniCard = ({ item }: { item: (typeof ALUMNI_DATA)[0] }) => (
    <FlipCard item={item} textColor={textColor} />
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView style={[styles.container]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ThemedText style={[styles.headerText, { color: textColor }]}>
            Bomber Alumni
          </ThemedText>
        </View>

        {/* Year Dropdown */}
        <View style={styles.dropdownContainer}>
          <CustomSelect
            label="Select Year"
            options={YEAR_OPTIONS}
            defaultValue="All"
            onSelect={(val) => setSelectedYear(val)}
          />
        </View>

        {/* Alumni Grid */}
        <FlatList
          ref={listRef}
          data={filteredData}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderAlumniCard}
        />

        {/* “Load More” Button */}
        <View style={styles.loadMoreContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLoadMore}
            style={styles.loadMoreButton}
          >
            <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Floating Scroll-to-Top Button (glassy “squircle”) */}
        <TouchableOpacity
          style={styles.floatingContainer}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <BlurView intensity={50} tint="light" style={styles.floatingBlur}>
            <Ionicons name="arrow-up" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // two columns, 16px side padding + 16px between
const CARD_HEIGHT = CARD_WIDTH * 1.2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
  },

  dropdownContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // FlipCard wrapper
  cardWrapper: {
    flex: 1,
    margin: 8,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android elevation
    elevation: 4,
  },
  cardBlur: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)', // fallback if blur isn’t available
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Container that is rotated (3D)
  flipContainer: {
    width: '100%',
    height: '100%',
  },
  faceContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    height: CARD_HEIGHT * 0.4,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  alumName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  schoolText: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 6,
  },
  achievementsFull: {
    marginTop: 12,
    width: '100%',
  },
  achievementText: {
    fontSize: 10,
    marginBottom: 4,
  },

  loadMoreContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  loadMoreButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Floating “squircle” scroll-to-top button
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  floatingBlur: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    // Outer shadow so it really hovers
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
