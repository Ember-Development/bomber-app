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

export default function TeamsScreen() {
  const { data: teams = [], isLoading } = useTeams();
  const stateOptions = ['ALL', ...US_STATES.map((s) => s.label)];
  const [search, setSearch] = useState('');
  const [activeState, setActiveState] = useState('ALL');
  const styles = createTeamsScreenStyles();
  const router = useRouter();
  const getFilterValue = (label: string) =>
    label === 'ALL'
      ? 'ALL'
      : (US_STATES.find((s) => s.label === label)?.value ?? label);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesState = activeState === 'ALL' || team.state === activeState;
    return matchesSearch && matchesState;
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerName}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Find a Bomber Team</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Enter team name"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FilterChips
          selected={activeState}
          onSelect={(label) => setActiveState(getFilterValue(label))}
          options={stateOptions}
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
  );
}
