import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommits } from '@/hooks/useCommit';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { CommitFE } from '@bomber-app/database';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

const ROW_HORIZONTAL_PADDING = 16;
const ROW_HEIGHT = 100;

export default function CommitmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  const { data: commits, isLoading } = useCommits();

  const allYears = [
    ...new Set(
      (commits ?? [])
        .map((c) =>
          c.committedDate
            ? new Date(c.committedDate).getFullYear().toString()
            : null
        )
        .filter((y): y is string => y !== null)
    ),
  ].sort((a, b) => b.localeCompare(a));

  const [selectedYear, setSelectedYear] = useState<string>(
    allYears[0] ?? new Date().getFullYear().toString()
  );

  useEffect(() => {
    if (allYears.length > 0 && !allYears.includes(selectedYear)) {
      setSelectedYear(allYears[0]);
    }
  }, [commits]);

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const onScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = e.nativeEvent.contentOffset.y;
    setShowScrollButton(yOffset > 100);
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const filteredCommits: CommitFE[] = (commits ?? [])
    .filter(
      (c) =>
        c.committedDate &&
        new Date(c.committedDate).getFullYear().toString() === selectedYear
    )
    .sort(
      (a, b) =>
        new Date(b.committedDate).getTime() -
        new Date(a.committedDate).getTime()
    );

  const renderRow = ({ item }: { item: CommitFE }) => {
    const player = item.players?.[0];
    const user = player?.user;
    const playerName =
      user?.fname && user?.lname ? `${user.fname} ${user.lname}` : 'Unknown';
    const position = player?.pos1 || '—';
    const hometown = player?.address
      ? `${player.address.city}, ${player.address.state}`
      : '—';
    const formattedDate = item.committedDate
      ? formatDate(item.committedDate)
      : '—';

    return (
      <View style={styles.rowWrapper}>
        <BlurView intensity={30} tint="light" style={styles.rowBlur}>
          <View style={styles.rowContent}>
            <Image source={{ uri: item.imageUrl }} style={styles.logo} />
            <View style={styles.textContainer}>
              <ThemedText
                type="subtitle"
                style={[styles.playerText, { color: textColor }]}
              >
                {playerName} — {item.name}
              </ThemedText>
              <ThemedText
                type="default"
                style={[styles.detailText, { color: textColor }]}
              >
                {position} • {hometown} • Committed {formattedDate}
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

        {/* Header with Back button */}
                <View style={styles.headerName}>
        
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>

          <ThemedText style={[styles.headerText, { color: textColor }]}>
            {selectedYear} Commitments
          </ThemedText>

        </View>
        
        <View style={styles.dropdownWrapper}>
            <CustomSelect
              label="Year"
              options={allYears.map((y) => ({ label: y, value: y }))}
              defaultValue={selectedYear}
              onSelect={(value) => setSelectedYear(value)}
            />
        </View>

        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: textColor }]}>
              Loading commitments...
            </ThemedText>
          </View>
        ) : filteredCommits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: textColor }]}>
              No commitments yet for {selectedYear}.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={filteredCommits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderRow}
            onScroll={onScrollHandler}
            scrollEventThrottle={16}
          />
        )}

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
  headerName: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    gap: 10,
    marginBottom: 8,
    },
  backButton: {
    marginRight: 12,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 0,
    paddingTop: 10,
  },
  dropdownWrapper: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  listContent: {
    paddingHorizontal: ROW_HORIZONTAL_PADDING,
    paddingVertical: 12,
  },
  rowWrapper: {
    marginBottom: 16,
    height: ROW_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  rowBlur: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  logo: {
    width: ROW_HEIGHT * 0.6,
    height: ROW_HEIGHT * 0.6,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
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
