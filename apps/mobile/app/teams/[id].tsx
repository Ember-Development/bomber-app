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
import { BlurView } from 'expo-blur';
import { getRegionLabel } from '@/utils/region';
import ProfileModal from '../../features/teams/components/profileModal';
import { usePlayerById } from '@/hooks/teams/usePlayerById';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import fallbackImage from '@/assets/images/bomber-icon-blue.png';
import { formatAgeGroup, formatPosition } from '@/utils/enumOptions';

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
    : 'No Head Coach';

  const stateLabel =
    US_STATES.find((s) => s.value === team.state)?.label ?? team.state;

  const regionLabel = getRegionLabel(team.region);

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>{team.name}</Text>
            <Text style={styles.heroSubtitle}>
              {formatAgeGroup(team.ageGroup)} • {regionLabel} • {stateLabel}
            </Text>
          </View>

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
                <Text style={styles.infoValue}>
                  {formatAgeGroup(team.ageGroup)}
                </Text>
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

          {activeTab === 'Roster' && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Team Roster</Text>
              {team.players.map((player) => {
                const img = player.commit?.imageUrl;
                return (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.playerCard}
                    onPress={() => openPlayerModal(player.id)}
                  >
                    <View style={styles.avatarWrap}>
                      <Image
                        source={
                          player.commit?.imageUrl
                            ? { uri: player.commit.imageUrl }
                            : fallbackImage
                        }
                        style={styles.avatarImg}
                        resizeMode="contain"
                        onError={(e) => {}}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.playerName}>
                        {player.user?.fname} {player.user?.lname}
                      </Text>
                      <Text style={styles.playerDetails}>
                        #{player.jerseyNum} • {formatPosition(player.pos1)} /{' '}
                        {formatPosition(player.pos2)} • Grad {player.gradYear}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {activeTab === 'Staff' && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Coaching Staff</Text>
              {team.coaches.map((coach) => (
                <View key={coach.id} style={styles.playerCard}>
                  <View style={styles.avatarWrap}>
                    <Image
                      source={fallbackImage}
                      style={styles.avatarImg}
                      resizeMode="cover"
                      onError={(e) => {}}
                    />
                  </View>

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
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroTextWrap: {
    marginTop: 80,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  heroSubtitle: { color: '#ccc', fontSize: 14, marginTop: 4 },
  segmentTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    padding: 6,
    marginHorizontal: 20,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  infoCard: {
    padding: 20,
    paddingBottom: 32,
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
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    fontSize: 13,
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
});
