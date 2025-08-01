import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  Text,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAlumniPlayersPaginated } from '@/hooks/teams/useAlumniPlayer';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { router } from 'expo-router';

const fallbackLogo = require('@/assets/images/bomber-icon.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

function AlumniCard({ item }: { item: any }) {
  const schoolLogo = item.schoolLogo ? { uri: item.schoolLogo } : fallbackLogo;

  return (
    <BlurView intensity={30} tint="light" style={styles.cardWrapper}>
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
        style={styles.cardGradient}
      >
        <View style={styles.logoContainer}>
          <Image source={schoolLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.alumName}>
          {item.user?.fname} {item.user?.lname}
        </Text>

        <Text style={styles.schoolText}>
          {item.college || 'Bomber Alum'} • {item.gradYear}
        </Text>
      </LinearGradient>
    </BlurView>
  );
}

export default function AlumnisScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    refetch,
    isFetchingNextPage,
  } = useAlumniPlayersPaginated();

  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  const alumni = data?.pages.flat() || [];

  const yearOptions = [
    { label: 'All', value: 'All' },
    ...Array.from(new Set(alumni.map((a) => a.gradYear)))
      .filter(Boolean)
      .sort()
      .map((yr) => ({ label: yr, value: yr })),
  ];

  const filteredData =
    selectedYear === 'All'
      ? alumni
      : alumni.filter((a) => a.gradYear === selectedYear);

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const onScrollHandler = (e: {
    nativeEvent: { contentOffset: { y: any } };
  }) => {
    const yOffset = e.nativeEvent.contentOffset.y;
    setShowScrollButton(yOffset > 100);
  };

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  if (isError) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.center}>
          <Text style={{ color: '#fff' }}>Failed to load alumni</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={{ color: '#00f', marginTop: 12 }}>Retry</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Bomber Alumni</Text>
        </View>

        <View style={styles.dropdownContainer}>
          <CustomSelect
            label="Select Year"
            options={yearOptions}
            defaultValue="All"
            onSelect={(val) => setSelectedYear(val)}
          />
        </View>

        <FlatList
          ref={listRef}
          data={filteredData}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AlumniCard item={item} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.6}
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#ccc" />
              </View>
            ) : null
          }
        />

        {showScrollButton && (
          <TouchableOpacity
            style={styles.floatingContainer}
            onPress={() =>
              listRef.current?.scrollToOffset({ offset: 0, animated: true })
            }
          >
            <BlurView intensity={50} tint="light" style={styles.floatingBlur}>
              <Ionicons name="arrow-up" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 0 },
  backButton: {
    marginRight: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  dropdownContainer: { marginHorizontal: 20, marginBottom: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  cardWrapper: {
    flex: 1,
    margin: 8,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardGradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    height: CARD_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
  },
  alumName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#fff',
  },
  schoolText: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  floatingBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingMore: {
    marginVertical: 16,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
