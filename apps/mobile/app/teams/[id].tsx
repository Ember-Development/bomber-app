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
import { LinearGradient } from 'expo-linear-gradient';
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

              <View style={styles.infoStack}>
                <View style={styles.infoCardModern}>
                  <LinearGradient
                    colors={[
                      'rgba(87, 164, 255, 0.1)',
                      'rgba(87, 164, 255, 0.05)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardRow}>
                      <View style={styles.infoCardLeft}>
                        <Ionicons
                          name="person-outline"
                          size={22}
                          color="#57a4ff"
                        />
                        <Text style={styles.infoCardLabel}>Head Coach</Text>
                      </View>
                      <Text style={styles.infoCardValue}>{coachName}</Text>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.infoCardModern}>
                  <LinearGradient
                    colors={[
                      'rgba(87, 164, 255, 0.1)',
                      'rgba(87, 164, 255, 0.05)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardRow}>
                      <View style={styles.infoCardLeft}>
                        <Ionicons
                          name="location-outline"
                          size={22}
                          color="#57a4ff"
                        />
                        <Text style={styles.infoCardLabel}>Team Region</Text>
                      </View>
                      <Text style={styles.infoCardValue}>{regionLabel}</Text>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.infoCardModern}>
                  <LinearGradient
                    colors={[
                      'rgba(87, 164, 255, 0.1)',
                      'rgba(87, 164, 255, 0.05)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardRow}>
                      <View style={styles.infoCardLeft}>
                        <Ionicons
                          name="calendar-outline"
                          size={22}
                          color="#57a4ff"
                        />
                        <Text style={styles.infoCardLabel}>Age Group</Text>
                      </View>
                      <Text style={styles.infoCardValue}>
                        {formatAgeGroup(team.ageGroup)}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.infoCardModern}>
                  <LinearGradient
                    colors={[
                      'rgba(87, 164, 255, 0.1)',
                      'rgba(87, 164, 255, 0.05)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardRow}>
                      <View style={styles.infoCardLeft}>
                        <Ionicons
                          name="map-outline"
                          size={22}
                          color="#57a4ff"
                        />
                        <Text style={styles.infoCardLabel}>State</Text>
                      </View>
                      <Text style={styles.infoCardValue}>{stateLabel}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              <Text style={[styles.infoTitle, { marginTop: 32 }]}>
                Trophy Case
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trophyScrollContainer}
              >
                {team.trophyCase.length > 0 ? (
                  [...team.trophyCase].reverse().map((trophy) => (
                    <View key={trophy.id} style={styles.trophyCard}>
                      <View style={styles.trophyImageContainer}>
                        <Image
                          source={{ uri: trophy.imageURL }}
                          style={styles.trophyImage}
                          resizeMode="cover"
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.6)']}
                          style={styles.trophyOverlay}
                        />
                      </View>
                      <View style={styles.trophyContent}>
                        <Ionicons
                          name="trophy"
                          size={16}
                          color="#FFD700"
                          style={styles.trophyIcon}
                        />
                        <Text style={styles.trophyText} numberOfLines={2}>
                          {trophy.title}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyTrophyContainer}>
                    <Ionicons
                      name="trophy-outline"
                      size={48}
                      color="rgba(255,255,255,0.3)"
                    />
                    <Text style={styles.emptyTrophyText}>No trophies yet.</Text>
                    <Text style={styles.emptyTrophySubtext}>
                      Check back soon for achievements!
                    </Text>
                  </View>
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
                      {coach.id === team.headCoachID ? 'Head Coach' : 'Coach'}
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
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flex: 1,
    minWidth: '47%',
    gap: 12,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(87, 164, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardContent: {
    flex: 1,
    gap: 4,
  },
  infoCardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
  trophyScrollContainer: {
    paddingVertical: 8,
    paddingRight: 20,
  },
  trophyCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  trophyImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  trophyImage: {
    width: '100%',
    height: '100%',
  },
  trophyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  trophyContent: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trophyIcon: {
    marginRight: 4,
  },
  trophyText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  emptyTrophyContainer: {
    width: width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  emptyTrophyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTrophySubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 6,
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
  infoStack: {
    gap: 12,
  },
  infoCardModern: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(87, 164, 255, 0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoCardGradient: {
    padding: 16,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
});
