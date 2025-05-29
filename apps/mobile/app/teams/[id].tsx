import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTeamById } from '@/hooks/teams/useTeams';
import { US_STATES } from '@/utils/state';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getRegionLabel } from '@/utils/region';
import ProfileModal from './components/profileModal';
import { usePlayerById } from '@/hooks/teams/usePlayerById';

const { width } = Dimensions.get('window');

const TabButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabButton, active && styles.tabButtonActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function TeamPage() {
  const { id } = useLocalSearchParams();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data: team } = useTeamById(id as string);
  const { data: selectedPlayer, isFetching: loadingPlayer } = usePlayerById(
    selectedPlayerId ?? ''
  );
  const [activeTab, setActiveTab] = useState<'Info' | 'Roster' | 'Staff'>(
    'Info'
  );
  const [isModalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  if (!team) return null;

  const openPlayerModal = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setModalVisible(true);
  };

  const closePlayerModal = () => {
    setSelectedPlayerId(null);
    setModalVisible(false);
  };

  const coachName = team.headCoach?.user
    ? `${team.headCoach.user.fname} ${team.headCoach.user.lname}`
    : 'Unknown Coach';

  const stateLabel =
    US_STATES.find((s) => s.value === team.state)?.label ?? team.state;

  const regionLabel = getRegionLabel(team.region);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Hero Image Banner */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/bomberback.jpg')}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.heroOverlay}
          />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>{team.name}</Text>
            <Text style={styles.heroSubtitle}>
              {team.ageGroup} • {regionLabel} • {stateLabel}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.segmentTabs}>
          {['Info', 'Roster', 'Staff'].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onPress={() => setActiveTab(tab as any)}
            />
          ))}
        </View>

        {/* Info Tab Layout */}
        {activeTab === 'Info' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Team Overview</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Coach</Text>
              <Text style={styles.infoValue}>{coachName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>{regionLabel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age Group</Text>
              <Text style={styles.infoValue}>{team.ageGroup}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>State</Text>
              <Text style={styles.infoValue}>{stateLabel}</Text>
            </View>

            <Text style={[styles.infoTitle, { marginTop: 24 }]}>
              Trophy Case
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {team.trophyCase.length > 0 ? (
                team.trophyCase.map((trophy) => (
                  <BlurView
                    key={trophy.id}
                    intensity={50}
                    tint="dark"
                    style={styles.trophyCard}
                  >
                    <Image
                      source={{ uri: trophy.imageURL }}
                      style={styles.trophyImage}
                    />
                    <Text style={styles.trophyText}>{trophy.title}</Text>
                  </BlurView>
                ))
              ) : (
                <Text style={styles.empty}>No trophies yet.</Text>
              )}
            </ScrollView>
          </View>
        )}

        {/* Roster Tab Layout */}
        {activeTab === 'Roster' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Team Roster</Text>
            {team.players.map((player) => (
              <TouchableOpacity
                key={player.id}
                style={styles.playerCard}
                onPress={() => openPlayerModal(player.id)}
              >
                <View style={styles.playerAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerName}>
                    {player.user?.fname} {player.user?.lname}
                  </Text>
                  <Text style={styles.playerDetails}>
                    #{player.jerseyNum} • {player.pos1} / {player.pos2} • Grad{' '}
                    {player.gradYear}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {activeTab === 'Staff' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Coaching Staff</Text>
            {team.coaches.map((coach) => (
              <View key={coach.id} style={styles.playerCard}>
                <View style={styles.playerAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerName}>
                    {coach.user?.fname} {coach.user?.lname}
                  </Text>
                  <Text style={styles.playerDetails}>
                    {coach.id === team.headCoachID
                      ? 'Head Coach'
                      : 'Assistant Coach'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingBack}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color="black" />
      </TouchableOpacity>

      <ProfileModal
        isVisible={isModalVisible}
        onClose={closePlayerModal}
        player={selectedPlayer ?? null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  heroContainer: { width, height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroTextWrap: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  heroSubtitle: { color: '#ddd', fontSize: 14, marginTop: 4 },
  segmentTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0d0d0d',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#ccc',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000',
  },
  infoCard: {
    backgroundColor: '#0d0d0d',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingVertical: 12,
  },
  infoLabel: {
    color: '#aaa',
    fontWeight: '500',
  },
  infoValue: {
    color: '#fff',
    fontWeight: '600',
  },
  trophyCard: {
    width: 120,
    height: 140,
    marginRight: 12,
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  trophyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  trophyText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerDetails: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: '#777',
    fontStyle: 'italic',
    marginVertical: 8,
  },
  floatingBack: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
