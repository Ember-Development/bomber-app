import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNormalizedUser } from '@/utils/user';
import { GlobalColors } from '@/constants/Colors';
import { PlayerFE, TeamFE } from '@bomber-app/database';
import { usePlayerById, useDeletePlayer } from '@/hooks/teams/usePlayerById';
import { useCoachById, useDeleteCoach } from '@/hooks/teams/useCoach';
import { useTeams } from '@/hooks/teams/useTeams';
import Separator from '@/components/ui/atoms/Seperator';
import RenderCards, { CardItem } from './components/render-content';
import ProfileModal from './components/profile-role-modal';
import EditPlayerModal from './components/update-player';
import RemovePlayerModal from './components/remove-player';
import EditCoachModal from './components/edit-coach-modal';
import RemoveCoachModal from './components/remove-coach-modal';
import EditTrophyModal from './components/edit-trophy-modal';
import RemoveTrophyModal from './components/remove-trophy-modal';

export default function ProfileTabs() {
  const { user, primaryRole } = useNormalizedUser();
  const isCoach = primaryRole === 'COACH';
  const isParent = primaryRole === 'PARENT';
  const isFan = primaryRole === 'FAN';
  const isRegionalCoach = primaryRole === 'REGIONAL_COACH';
  const isAlsoCoach = !!user?.coach?.teams?.length;
  const isAlsoParent = !!user?.parent?.children?.length;

  const [activeTab, setActiveTab] = useState<
    'info' | 'contact' | 'gear' | 'region'
  >(isFan ? 'contact' : isCoach ? 'contact' : 'info');
  const [view, setView] = useState<'roster' | 'staff' | 'trophies'>('roster');
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [removePlayerId, setRemovePlayerId] = useState<string | null>(null);
  const [editCoachId, setEditCoachId] = useState<string | null>(null);
  const [removeCoachId, setRemoveCoachId] = useState<string | null>(null);
  const [editTrophy, setEditTrophy] = useState<{
    teamId: string;
    trophy: any;
  } | null>(null);
  const [removeTrophy, setRemoveTrophy] = useState<{
    teamId: string;
    trophy: any;
  } | null>(null);
  const [selectedRegionTeamId, setSelectedRegionTeamId] = useState<
    string | null
  >(null);
  const [selectedProfile, setSelectedProfile] = useState<PlayerFE | null>(null);

  const { data: selectedPlayer } = usePlayerById(editPlayerId ?? '');
  const { data: selectedPlayerToRemove } = usePlayerById(removePlayerId ?? '');
  const { data: selectedCoach } = useCoachById(editCoachId ?? '');
  const { data: selectedCoachToRemove } = useCoachById(removeCoachId ?? '');
  const { data: allTeams = [] } = useTeams();

  const regionTeams = useMemo(() => {
    if (!user?.regCoach?.region) return [];
    return allTeams.filter((t) => t.region === user?.regCoach?.region);
  }, [allTeams, user?.regCoach?.region]);

  const { mutate: deletePlayer } = useDeletePlayer({
    onSuccess: () => setRemovePlayerId(null),
  });
  const { mutate: deleteCoach } = useDeleteCoach({
    onSuccess: () => setRemoveCoachId(null),
  });

  // Coach team view
  const renderTeamTabs = () => {
    const teams = user?.coach?.teams || [];
    const tabs = ['roster', 'staff', 'trophies'] as const;

    return (
      <View style={{ marginTop: 24 }}>
        <View style={styles.teamTabRow}>
          {tabs.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.teamTab, view === key && styles.activeTab]}
              onPress={() => setView(key)}
            >
              <Text
                style={[styles.tabText, view === key && styles.tabTextActive]}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {teams.map((team: TeamFE) => {
          const teamData: Record<typeof view, CardItem[]> = {
            roster:
              team.players?.map((p) => ({
                label:
                  `${p.user?.fname ?? ''} ${p.user?.lname ?? ''}`.trim() ||
                  `Player ${p.id}`,
                value: `#${p.jerseyNum}`,
                fullWidth: true,
                player: p,
                onEdit: () => setEditPlayerId(p.id),
                onRemove: () => setRemovePlayerId(p.id),
              })) || [],
            staff:
              team.coaches?.map((c) => ({
                label:
                  `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim() ||
                  `Coach ${c.id}`,
                value: 'Coach',
                fullWidth: true,
                onEdit: () => setEditCoachId(c.id),
                onRemove: () => setRemoveCoachId(c.id),
              })) || [],
            trophies:
              team.trophyCase?.map((t) => ({
                label: t.title || `Trophy ${t.id}`,
                value: '🏆',
                fullWidth: true,
                onEdit: () => setEditTrophy({ teamId: team.id, trophy: t }),
                onRemove: () => setRemoveTrophy({ teamId: team.id, trophy: t }),
              })) || [],
          };

          return (
            <View key={team.id} style={styles.tableSection}>
              <Text style={styles.teamTitle}>Coach for {team.name}</Text>
              <RenderCards
                data={teamData[view]}
                onSelectPlayer={(p) => setSelectedProfile(p)}
              />
            </View>
          );
        })}
      </View>
    );
  };

  // Regional coach view
  const renderRegionTeams = () => {
    if (selectedRegionTeamId) {
      const team = regionTeams.find((t) => t.id === selectedRegionTeamId);
      if (!team) return null;
      const tabs = ['roster', 'staff', 'trophies'] as const;
      const teamData: Record<typeof view, CardItem[]> = {
        roster:
          team.players?.map((p) => ({
            label:
              `${p.user?.fname ?? ''} ${p.user?.lname ?? ''}`.trim() ||
              `Player ${p.id}`,
            value: `#${p.jerseyNum}`,
            fullWidth: true,
            player: p,
            onEdit: () => setEditPlayerId(p.id),
            onRemove: () => setRemovePlayerId(p.id),
          })) || [],
        staff:
          team.coaches?.map((c) => ({
            label:
              `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim() ||
              `Coach ${c.id}`,
            value: 'Coach',
            fullWidth: true,
            onEdit: () => setEditCoachId(c.id),
            onRemove: () => setRemoveCoachId(c.id),
          })) || [],
        trophies:
          team.trophyCase?.map((t) => ({
            label: t.title || `Trophy ${t.id}`,
            value: '🏆',
            fullWidth: true,
            onEdit: () => setEditTrophy({ teamId: team.id, trophy: t }),
            onRemove: () => setRemoveTrophy({ teamId: team.id, trophy: t }),
          })) || [],
      };

      return (
        <View style={{ marginTop: 16 }}>
          <TouchableOpacity onPress={() => setSelectedRegionTeamId(null)}>
            <Text style={styles.backLink}>← Back to Region Teams</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{team.name}</Text>
          <View style={styles.teamTabRow}>
            {tabs.map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.teamTab, view === key && styles.activeTab]}
                onPress={() => setView(key)}
              >
                <Text
                  style={[styles.tabText, view === key && styles.tabTextActive]}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <RenderCards
            data={teamData[view]}
            onSelectPlayer={(p) => setSelectedProfile(p)}
          />
        </View>
      );
    }

    const data: CardItem[] = regionTeams.map((t) => ({
      label: t.name,
      value: `${t.ageGroup} • ${t.region}`,
      fullWidth: true,
      onRemove: undefined,
      onEdit: undefined,
    }));

    return (
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Region Teams</Text>
        <RenderCards
          data={data}
          onPress={(label) => {
            const team = regionTeams.find((t) => t.name === label);
            if (team) setSelectedRegionTeamId(team.id);
          }}
        />
      </View>
    );
  };

  // Main content renderer
  const renderContent = () => {
    if (isRegionalCoach) {
      if (activeTab === 'contact') {
        return (
          <RenderCards
            data={[
              { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
              { label: 'Phone', value: user?.phone ?? 'N/A', fullWidth: true },
            ]}
          />
        );
      }
      if (activeTab === 'info') {
        return (
          <>
            {isAlsoCoach && renderTeamTabs()}
            <Separator />
            {isAlsoParent && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>My Athletes</Text>
                <RenderCards
                  data={
                    user?.parent?.children?.map((c) => ({
                      label:
                        `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim() ||
                        `Player ${c.id}`,
                      value: `#${c.jerseyNum}`,
                      fullWidth: true,
                      player: c,
                      onEdit: () => setEditPlayerId(c.id),
                      onRemove: () => setRemovePlayerId(c.id),
                    })) || []
                  }
                  onSelectPlayer={(p) => setSelectedProfile(p)}
                />
              </View>
            )}
          </>
        );
      }
      if (activeTab === 'region') return renderRegionTeams();
    }

    if (isCoach && activeTab === 'contact') {
      return (
        <RenderCards
          data={[
            { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
            { label: 'Phone', value: user?.phone ?? 'N/A', fullWidth: true },
            {
              label: 'Street Address',
              value: user?.coach?.address
                ? `${user.coach.address.address1} ${user.coach.address.address2 ?? ''}`.trim()
                : 'N/A',
              fullWidth: true,
            },
            { label: 'City', value: user?.coach?.address?.city ?? 'N/A' },
            { label: 'State', value: user?.coach?.address?.state ?? 'N/A' },
            { label: 'Zipcode', value: user?.coach?.address?.zip ?? 'N/A' },
          ]}
        />
      );
    }
    if (isCoach && activeTab === 'info') {
      return renderTeamTabs();
    }

    if (isParent && activeTab === 'contact') {
      return (
        <RenderCards
          data={[
            { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
            { label: 'Phone', value: user?.phone ?? 'N/A', fullWidth: true },
            {
              label: 'Street Address',
              value: user?.parent?.address
                ? `${user.parent.address.address1} ${user.parent.address.address2 ?? ''}`.trim()
                : 'N/A',
              fullWidth: true,
            },
            { label: 'City', value: user?.parent?.address?.city ?? 'N/A' },
            { label: 'State', value: user?.parent?.address?.state ?? 'N/A' },
            { label: 'Zipcode', value: user?.parent?.address?.zip ?? 'N/A' },
          ]}
        />
      );
    }
    if (isParent && activeTab === 'info') {
      return (
        <View style={{ marginTop: 20 }}>
          <RenderCards
            data={[
              {
                label: 'Teams',
                value:
                  [
                    ...new Set(
                      user?.parent?.children
                        ?.map((ch) => ch.team?.name)
                        .filter(Boolean) || []
                    ),
                  ].join(', ') || 'N/A',
                fullWidth: true,
              },
            ]}
          />
          <Text style={styles.sectionTitle}>My Athletes</Text>
          <RenderCards
            data={
              user?.parent?.children?.map((c) => ({
                label:
                  `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim() ||
                  `Player ${c.id}`,
                value: `#${c.jerseyNum}`,
                fullWidth: true,
                player: c,
                onEdit: () => setEditPlayerId(c.id),
                onRemove: () => setRemovePlayerId(c.id),
              })) || []
            }
            onSelectPlayer={(p) => setSelectedProfile(p)}
          />
        </View>
      );
    }

    if (!isCoach && !isParent && !isRegionalCoach && !isFan) {
      // Player view
      if (activeTab === 'info') {
        return (
          <RenderCards
            data={[
              {
                label: 'Team',
                value: user?.player?.team?.name ?? 'N/A',
                fullWidth: true,
              },
              { label: 'Grad Year', value: user?.player?.gradYear ?? 'N/A' },
              { label: 'Age Group', value: user?.player?.ageGroup ?? 'N/A' },
              { label: 'Pos 1', value: user?.player?.pos1 ?? 'N/A' },
              { label: 'Pos 2', value: user?.player?.pos2 ?? 'N/A' },
              {
                label: 'College Commitment',
                value: user?.player?.college ?? 'Uncommitted',
                fullWidth: true,
              },
            ]}
          />
        );
      }
      if (activeTab === 'contact') {
        return (
          <RenderCards
            data={[
              { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
              { label: 'Phone', value: user?.phone ?? 'N/A' },
              { label: 'Date of Birth', value: user?.player?.dob ?? 'N/A' },
              {
                label: 'Street Address',
                value: user?.player?.address
                  ? `${user.player.address.address1} ${user.player.address.address2 ?? ''}`.trim()
                  : 'N/A',
                fullWidth: true,
              },
              { label: 'City', value: user?.player?.address?.city ?? 'N/A' },
              { label: 'State', value: user?.player?.address?.state ?? 'N/A' },
              { label: 'Zipcode', value: user?.player?.address?.zip ?? 'N/A' },
            ]}
          />
        );
      }
      if (activeTab === 'gear') {
        const gearItems = [
          { label: 'Jersey Size', value: user?.player?.jerseySize ?? 'N/A' },
          { label: 'Pant Size', value: user?.player?.pantSize ?? 'N/A' },
          { label: 'Stirrup Size', value: user?.player?.stirrupSize ?? 'N/A' },
          { label: 'Short Size', value: user?.player?.shortSize ?? 'N/A' },
          {
            label: 'Practice Short Size',
            value: user?.player?.practiceShortSize ?? 'N/A',
          },
        ];
        if (gearItems.length % 2 !== 0)
          gearItems[gearItems.length - 1].fullWidth = true;
        return <RenderCards data={gearItems} />;
      }
    }

    if (isFan && activeTab === 'contact') {
      return (
        <RenderCards
          data={[
            { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
            { label: 'Phone', value: user?.phone ?? 'N/A', fullWidth: true },
          ]}
        />
      );
    }

    return null;
  };

  return (
    <>
      <View>
        {!isFan && (
          <View style={styles.floatingTabsContainer}>
            <TabButton
              label={isCoach || isRegionalCoach ? 'Team' : 'Info'}
              active={activeTab === 'info'}
              onPress={() => setActiveTab('info')}
            />
            <TabButton
              label="Contact"
              active={activeTab === 'contact'}
              onPress={() => setActiveTab('contact')}
            />
            {!isCoach && !isParent && !isRegionalCoach && (
              <TabButton
                label="Gear"
                active={activeTab === 'gear'}
                onPress={() => setActiveTab('gear')}
              />
            )}
            {isRegionalCoach && (
              <TabButton
                label="Region"
                active={activeTab === 'region'}
                onPress={() => setActiveTab('region')}
              />
            )}
          </View>
        )}
        <ScrollView>{renderContent()}</ScrollView>
      </View>

      {/* Profile Preview Modal */}
      {selectedProfile && (
        <ProfileModal
          isVisible
          onClose={() => setSelectedProfile(null)}
          player={selectedProfile}
        />
      )}

      {/* Coach/Player/Trophy Modals */}
      {editPlayerId && selectedPlayer && (
        <EditPlayerModal
          visible
          player={selectedPlayer}
          onClose={() => setEditPlayerId(null)}
        />
      )}
      {removePlayerId && selectedPlayerToRemove && (
        <RemovePlayerModal
          visible
          playerName={`${selectedPlayerToRemove.user?.fname} ${selectedPlayerToRemove.user?.lname}`}
          onClose={() => setRemovePlayerId(null)}
          onConfirm={() => deletePlayer(removePlayerId!)}
        />
      )}
      {editCoachId && selectedCoach && (
        <EditCoachModal
          visible
          coach={selectedCoach}
          onClose={() => setEditCoachId(null)}
        />
      )}
      {removeCoachId && selectedCoachToRemove && (
        <RemoveCoachModal
          visible
          coachName={`${selectedCoachToRemove.user?.fname} ${selectedCoachToRemove.user?.lname}`}
          onClose={() => setRemoveCoachId(null)}
          onConfirm={() => deleteCoach(removeCoachId!)}
        />
      )}
      {editTrophy && (
        <EditTrophyModal
          visible
          teamId={editTrophy.teamId}
          trophy={editTrophy.trophy}
          onClose={() => setEditTrophy(null)}
        />
      )}
      {removeTrophy && (
        <RemoveTrophyModal
          visible
          teamId={removeTrophy.teamId}
          trophyId={removeTrophy.trophy.id}
          trophyTitle={removeTrophy.trophy.title}
          onClose={() => setRemoveTrophy(null)}
        />
      )}
    </>
  );
}

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

const styles = StyleSheet.create({
  floatingTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    padding: 6,
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
    color: '#bbb',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 700,
  },
  teamTabRow: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
  },
  teamTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: GlobalColors.bomber,
  },
  tableSection: {
    marginBottom: 24,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    marginTop: 10,
  },
  backLink: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rowLarge: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    marginTop: 14,
  },
  rowContent: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  cellLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  action: {
    color: GlobalColors.bomber,
    fontSize: 13,
    fontWeight: '600',
  },
  actionDelete: {
    color: '#ff8080',
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  teamLabel: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
});
