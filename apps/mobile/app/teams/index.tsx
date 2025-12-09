import {
  SafeAreaView,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTeams } from '@/hooks/teams/useTeams';
import TeamCard from '../../features/teams/components/teamcard';
import FilterChips from '@/components/ui/molecules/FilterChip';
import { createTeamsScreenStyles } from '../../styles/teamscreenStyle';
import { useRouter } from 'expo-router';
import { STATE_ABBR, toAbbr, US_STATES } from '@/utils/state';
import SearchField from '@/components/ui/atoms/Search';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

const AGE_RANK = {
  U18: 1,
  U16: 2,
  U14: 3,
  U12: 4,
  U10: 5,
  U8: 6,
  ALUMNI: 999,
} as const;

type AgeKey = keyof typeof AGE_RANK;

const TOP_AGES: ReadonlySet<AgeKey> = new Set([
  'U18',
  'U16',
  'U14',
  'U12',
] as const);

// normalize incoming values like "18U" -> "U18"
const normAge = (s: string): string =>
  s?.toUpperCase().replace(/^(\d{1,2})U$/, 'U$1');

const isAgeKey = (s: string): s is AgeKey => s in AGE_RANK;

const isAcademyRegion = (r?: string) => r?.toUpperCase() === 'ACADEMY';

const getRank = (s: string): number => {
  const n = normAge(s);
  return isAgeKey(n) ? AGE_RANK[n] : 999;
};

const AGE_OPTIONS: Array<'ALL' | AgeKey> = [
  'ALL',
  'U18',
  'U16',
  'U14',
  'U12',
  'U10',
  'U8',
  'ALUMNI',
];

export default function TeamsScreen() {
  const { data: teams = [], isLoading } = useTeams();
  const [search, setSearch] = useState('');
  const [activeState, setActiveState] = useState('ALL');
  const [activeRegion, setActiveRegion] = useState('ALL');
  const [activeAge, setActiveAge] = useState<'ALL' | AgeKey>('ALL');
  const [filtersExpanded, setFiltersExpanded] = useState(false); // New state
  const styles = createTeamsScreenStyles();
  const router = useRouter();

  const stateOptions = ['ALL', ...US_STATES.map((s) => s.label)];
  const regionOptions: string[] = [
    'ALL',
    ...Array.from(new Set(teams.map((t) => t.region).filter(Boolean))),
  ];
  const ageOptions = AGE_OPTIONS;

  const getFilterValue = (label: string) =>
    label === 'ALL' ? 'ALL' : (STATE_ABBR[label] ?? label);

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase();

    return [...teams]
      .filter((team) => {
        const matchesSearch =
          team.name.toLowerCase().includes(q) ||
          team.coaches?.some((c) =>
            `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`
              .toLowerCase()
              .includes(q)
          );

        const matchesState =
          activeState === 'ALL' || toAbbr(team.state) === toAbbr(activeState);
        const matchesRegion =
          activeRegion === 'ALL' || team.region === activeRegion;

        const teamAgeNorm = normAge(team.ageGroup);
        const matchesAge =
          activeAge === 'ALL' ||
          (isAgeKey(teamAgeNorm) && teamAgeNorm === activeAge);

        return matchesSearch && matchesState && matchesRegion && matchesAge;
      })
      .sort((a, b) => {
        // age bucket order
        const ageCmp = getRank(a.ageGroup) - getRank(b.ageGroup);
        if (ageCmp !== 0) return ageCmp;

        // academy region first within same age
        const aReg = isAcademyRegion(a.region) ? 0 : 1;
        const bReg = isAcademyRegion(b.region) ? 0 : 1;
        if (aReg !== bReg) return aReg - bReg;

        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
  }, [teams, search, activeState, activeRegion, activeAge]);

  const clearFilters = () => {
    setActiveState('ALL');
    setActiveRegion('ALL');
    setActiveAge('ALL');
    // setSearch(''); // uncomment if you also want to clear search
  };

  const formatActiveFilters = () => {
    const parts: string[] = [];
    if (activeState !== 'ALL') parts.push(`State: ${activeState}`);
    if (activeRegion !== 'ALL') parts.push(`Region: ${activeRegion}`);
    if (activeAge !== 'ALL') parts.push(`Age: ${activeAge}`);
    return parts.length ? parts.join('  •  ') : 'All teams';
  };

  const hasActiveFilters =
    activeState !== 'ALL' || activeRegion !== 'ALL' || activeAge !== 'ALL';

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.headerName}>
          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Find a Bomber Team</Text>
        </View>

        <View style={styles.header}>
          <View style={styles.searchBox}>
            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Search teams by name..."
            />
          </View>

          {/* Collapsible Filters */}
          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={styles.filtersHeader}
              onPress={() => setFiltersExpanded(!filtersExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.filtersHeaderLeft}>
                <Ionicons
                  name="filter-outline"
                  size={18}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.filtersHeaderText}>Filters</Text>
                {hasActiveFilters && (
                  <View style={styles.activeFiltersBadge}>
                    <Text style={styles.activeFiltersBadgeText}>
                      {
                        [
                          activeState !== 'ALL' && activeState,
                          activeRegion !== 'ALL' && activeRegion,
                          activeAge !== 'ALL' && activeAge,
                        ].filter(Boolean).length
                      }
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons
                name={filtersExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>

            {filtersExpanded && (
              <View style={styles.filtersContent}>
                {/* State Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>State</Text>
                  <FilterChips
                    selected={activeState}
                    onSelect={(label) => setActiveState(getFilterValue(label))}
                    options={stateOptions}
                  />
                </View>

                {/* Region Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Region</Text>
                  <FilterChips
                    selected={activeRegion}
                    onSelect={(label) => setActiveRegion(label)}
                    options={regionOptions}
                  />
                </View>

                {/* Age Division Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Age Division</Text>
                  <FilterChips
                    selected={activeAge}
                    onSelect={(label) => setActiveAge(label as 'ALL' | AgeKey)}
                    options={ageOptions}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Teams</Text>

        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingBottom: 60,
            paddingHorizontal: 16,
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              onPress={() => router.push(`/teams/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 48,
              }}
            >
              <Ionicons name="alert-circle-outline" size={36} color="white" />
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                No teams match your filters
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                {formatActiveFilters()}
              </Text>

              <TouchableOpacity
                onPress={clearFilters}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                }}
                accessibilityRole="button"
                accessibilityLabel="Clear filters"
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Clear filters
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
