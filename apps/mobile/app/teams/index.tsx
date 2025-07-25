import {
  SafeAreaView,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTeams } from '@/hooks/teams/useTeams';
import TeamCard from './components/teamcard';
import FilterChips from '@/components/ui/molecules/FilterChip';
import { createTeamsScreenStyles } from '../../styles/teamscreenStyle';
import { useRouter } from 'expo-router';
import { US_STATES } from '@/utils/state';
import SearchField from '@/components/ui/atoms/Search';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';

export default function TeamsScreen() {
  const { data: teams = [], isLoading } = useTeams();
  const [search, setSearch] = useState('');
  const [activeState, setActiveState] = useState('ALL');
  const [activeRegion, setActiveRegion] = useState('ALL');
  const styles = createTeamsScreenStyles();
  const router = useRouter();

  const stateOptions = ['ALL', ...US_STATES.map((s) => s.label)];
  const regionOptions: string[] = [
    'ALL',
    ...Array.from(new Set(teams.map((t) => t.region).filter(Boolean))),
  ];

  const getFilterValue = (label: string) =>
    label === 'ALL'
      ? 'ALL'
      : (US_STATES.find((s) => s.label === label)?.value ?? label);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.coaches?.some((c) =>
        `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    const matchesState = activeState === 'ALL' || team.state === activeState;
    const matchesRegion =
      activeRegion === 'ALL' || team.region === activeRegion;
    return matchesSearch && matchesState && matchesRegion;
  });

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.headerName}>
          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Find a Bomber Team</Text>
        </View>

        <View style={styles.header}>
          <View style={styles.searchBox}>
            <SearchField />
          </View>
          <FilterChips
            selected={activeState}
            onSelect={(label) => setActiveState(getFilterValue(label))}
            options={stateOptions}
          />
          <FilterChips
            selected={activeRegion}
            onSelect={(label) => setActiveRegion(label)}
            options={regionOptions}
          />
        </View>

        <Text style={styles.sectionTitle}>Teams</Text>

        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              onPress={() => router.push(`/teams/${item.id}`)}
            />
          )}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
