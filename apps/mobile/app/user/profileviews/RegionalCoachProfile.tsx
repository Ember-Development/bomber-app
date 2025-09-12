import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import RenderCards, { CardItem } from '../components/render-content';
import CoachProfile from './CoachProfile';
import CustomButton from '@/components/ui/atoms/Button';
import { styles } from '@/styles/ProfileTabsStyle';
import { PlayerFE } from '@bomber-app/database';

const tabs = ['roster', 'staff', 'trophies'] as const;
type TabKey = (typeof tabs)[number];

type Props = {
  user: any;
  activeTab: string;
  isAlsoCoach: boolean;
  hasParentRecord: boolean;
  view: TabKey;
  setView: (v: TabKey) => void;
  regionTeams: any[];
  selectedRegionTeamId: string | null;
  setSelectedRegionTeamId: (id: string | null) => void;
  setEditPlayerId: (id: string) => void;
  setRemovePlayerId: (id: string) => void;
  setEditCoachId: (id: string) => void;
  setRemoveCoachId: (id: string) => void;
  setEditTrophy: (x: any) => void;
  setRemoveTrophy: (x: any) => void;
  setSelectedProfile: (x: any) => void;
};

export default function RegionalCoachProfile({
  user,
  activeTab,
  isAlsoCoach,
  hasParentRecord,
  view,
  setView,
  regionTeams,
  selectedRegionTeamId,
  setSelectedRegionTeamId,
  setEditPlayerId,
  setRemovePlayerId,
  setEditCoachId,
  setRemoveCoachId,
  setEditTrophy,
  setRemoveTrophy,
  setSelectedProfile,
}: Props) {
  const router = useRouter();

  // Contact
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

  // Players (if also a parent)
  if (hasParentRecord && activeTab === 'players') {
    const parentUserId = user?.parent?.id;

    return (
      <View style={{ marginTop: 20 }}>
        <RenderCards
          data={[
            {
              label: 'Player Teams',
              value:
                [
                  ...new Set(
                    user.parent.children
                      .map((ch: any) => ch.team?.name)
                      .filter(Boolean)
                  ),
                ].join(', ') || 'N/A',
              fullWidth: true,
            },
          ]}
        />

        <CustomButton
          title="+ Add New Player"
          onPress={() =>
            router.push({
              pathname: '/user/components/add-player-start',
              params: { parentUserId: String(parentUserId ?? '') },
            })
          }
        />

        <Text style={styles.sectionTitle}>My Athletes</Text>
        <RenderCards
          data={user.parent.children.map((c: any) => ({
            label: `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim(),
            value: `#${c.jerseyNum}`,
            fullWidth: true,
            player: c,
            onEdit: () => setEditPlayerId(c.id),
            onRemove: () => setRemovePlayerId(c.id),
          }))}
          onSelectPlayer={(p: PlayerFE) => setSelectedProfile(p)}
        />
      </View>
    );
  }

  // Info (delegate)
  if (activeTab === 'info' && isAlsoCoach) {
    return (
      <CoachProfile
        user={user}
        activeTab={activeTab}
        view={view}
        setView={setView}
        hasParentRecord={hasParentRecord}
        setEditPlayerId={setEditPlayerId}
        setRemovePlayerId={setRemovePlayerId}
        setEditCoachId={setEditCoachId}
        setRemoveCoachId={setRemoveCoachId}
        setEditTrophy={setEditTrophy}
        setRemoveTrophy={setRemoveTrophy}
        setSelectedProfile={setSelectedProfile}
      />
    );
  }

  // Region
  if (activeTab === 'region') {
    if (selectedRegionTeamId) {
      const team = regionTeams.find((t: any) => t.id === selectedRegionTeamId);
      if (!team) return null;

      const teamData: Record<TabKey, CardItem[]> = {
        roster:
          team.players?.map((p: any) => ({
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
          team.coaches?.map((c: any) => ({
            label:
              `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim() ||
              `Coach ${c.id}`,
            value: 'Coach',
            fullWidth: true,
            onEdit: () => setEditCoachId(c.id),
            onRemove: () => setRemoveCoachId(c.id),
          })) || [],
        trophies:
          team.trophyCase?.map((t: any) => ({
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
            onSelectPlayer={(p: any) => setSelectedProfile(p)}
          />
        </View>
      );
    }

    const data: CardItem[] = regionTeams.map((t: any) => ({
      label: t.name,
      value: `${t.ageGroup} • ${t.region}`,
      fullWidth: true,
    }));

    return (
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Region Teams</Text>
        <RenderCards
          data={data}
          onPress={(label: string) => {
            const team = regionTeams.find((t: any) => t.name === label);
            if (team) setSelectedRegionTeamId(team.id);
          }}
        />
      </View>
    );
  }

  return null;
}
