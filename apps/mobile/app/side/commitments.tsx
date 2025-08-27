import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
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
import { CommitFE, PlayerFE } from '@bomber-app/database';
import { useRouter } from 'expo-router';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { formatPosition } from '@/utils/enumOptions';

const ROW_HORIZONTAL_PADDING = 16;

const getFirstPlayer = (c: CommitFE) => c.players?.[0];

const hasKnownPlayerName = (c: CommitFE) => {
  const p = getFirstPlayer(c);
  const fname = p?.user?.fname?.trim();
  const lname = p?.user?.lname?.trim();
  return Boolean(fname && lname);
};

// Replace your current getPlayerGradYear with this one
const getPlayerGradYear = (c: CommitFE): number | null => {
  const p = getFirstPlayer(c);
  if (!p || typeof p.gradYear !== 'string') return null;
  const y = Number(p.gradYear);
  return Number.isFinite(y) ? y : null;
};

export default function CommitmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  const { data: commits, isLoading } = useCommits();

  // “Living doc” rule:
  // - Today is 2025-08-27 -> lowest grad year we show is currentYear + 1 = 2026
  //   (2025s are now alumni and excluded here)
  const today = new Date();
  const currentYear = today.getFullYear(); // 2025
  const minGradYear = currentYear + 1; // 2026

  // Filter to valid commits with a player and a grad year >= minGradYear.
  const eligibleCommits: CommitFE[] = useMemo(() => {
    return (commits ?? []).filter((c) => {
      // must have a known player name
      if (!hasKnownPlayerName(c)) return false;

      // must meet living-doc grad-year rule (>= 2026 right now)
      const gy = getPlayerGradYear(c);
      return gy !== null && gy >= minGradYear;
    });
  }, [commits, minGradYear]);

  // Build the year dropdown from PLAYER GRAD YEARS (desc)
  const allYears = useMemo(() => {
    const set = new Set<string>();
    for (const c of eligibleCommits) {
      const gy = getPlayerGradYear(c);
      if (gy) set.add(String(gy));
    }
    return [...set].sort((a, b) => Number(a) - Number(b));
  }, [eligibleCommits]);

  const [selectedYear, setSelectedYear] = useState<string>(
    allYears[0] ?? String(minGradYear)
  );

  useEffect(() => {
    if (allYears.length > 0 && !allYears.includes(selectedYear)) {
      setSelectedYear(allYears[0]);
    }
  }, [allYears, selectedYear]);

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

  // Filter by selected grad year and sort:
  // 1) Grad year DESC (redundant within a year filter but safe if no filter)
  // 2) Committed date DESC (newest first)
  const filteredCommits: CommitFE[] = useMemo(() => {
    const withinYear = eligibleCommits.filter((c) => {
      const gy = getPlayerGradYear(c);
      return String(gy) === selectedYear;
    });

    return withinYear.sort((a, b) => {
      const ga = getPlayerGradYear(a) ?? 0;
      const gb = getPlayerGradYear(b) ?? 0;
      if (gb !== ga) return gb - ga;
      const ad = a.committedDate ? new Date(a.committedDate).getTime() : 0;
      const bd = b.committedDate ? new Date(b.committedDate).getTime() : 0;
      return bd - ad;
    });
  }, [eligibleCommits, selectedYear]);

  const renderRow = ({ item }: { item: CommitFE }) => {
    if (!hasKnownPlayerName(item)) return null;
    const player = item.players?.[0];
    const user = player?.user;
    const playerName =
      user?.fname && user?.lname ? `${user.fname} ${user.lname}` : 'Unknown';
    const position = formatPosition(player?.pos1) || '—';
    const hometown = player?.address
      ? `${player.address.city}, ${player.address.state}`
      : '—';
    const formattedDate = item.committedDate
      ? formatDate(item.committedDate)
      : '—';
    const gradYear = player?.gradYear ?? '—';

    return (
      <View style={styles.rowWrapper}>
        <BlurView intensity={30} tint="light" style={styles.rowBlur}>
          <View style={styles.rowContent}>
            <Image source={{ uri: item.imageUrl }} style={styles.logo} />
            <View style={styles.textContainer}>
              <ThemedText
                type="subtitle"
                style={[styles.playerText, { color: textColor }]}
                // allow wrapping on all devices
              >
                {playerName} — {item.name}
              </ThemedText>

              <ThemedText
                type="default"
                style={[styles.detailText, { color: textColor }]}
              >
                {position} • {hometown}
              </ThemedText>

              <ThemedText
                type="default"
                style={[styles.detailText, { color: textColor }]}
              >
                Grad {gradYear} • Committed {formattedDate}
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
        {/* Header */}
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
            label="Grad Year"
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

  // Removed fixed height; use padding & minHeight so text can wrap on small screens
  rowWrapper: {
    marginBottom: 16,
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
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start', // allow text block to grow vertically
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },

  // Slightly smaller, consistent logo to prevent layout squeeze
  logo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 2,
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
