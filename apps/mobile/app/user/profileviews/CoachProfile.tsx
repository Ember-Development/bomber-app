import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import RenderCards, { CardItem } from '../components/render-content';
import CustomButton from '@/components/ui/atoms/Button';
import { styles } from '../../../styles/ProfileTabsStyle';

type Props = {
  user: any;
  activeTab: string;
  view: 'roster' | 'staff' | 'trophies';
  setView: (v: 'roster' | 'staff' | 'trophies') => void;
  hasParentRecord: boolean;
  setEditPlayerId: (id: string) => void;
  setRemovePlayerId: (id: string) => void;
  setEditCoachId: (id: string) => void;
  setRemoveCoachId: (x: { coachId: string; teamId: string }) => void;
  setAddTrophy: (teamId: string | null) => void;
  setEditTrophy: (x: any) => void;
  setRemoveTrophy: (x: any) => void;
  setSelectedProfile: (x: any) => void;
};

export default function CoachProfile({
  user,
  activeTab,
  view,
  setView,
  hasParentRecord,
  setEditPlayerId,
  setRemovePlayerId,
  setEditCoachId,
  setRemoveCoachId,
  setAddTrophy,
  setEditTrophy,
  setRemoveTrophy,
  setSelectedProfile,
}: Props) {
  const router = useRouter();

  // Contact tab
  if (activeTab === 'contact') {
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
          {
            label: 'Zipcode',
            value: user?.coach?.address?.zip ?? 'N/A',
            fullWidth: true,
          },
        ]}
      />
    );
  }

  // Players tab (if they also have a parent record)
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
                    user?.parent?.children
                      ?.map((ch: any) => ch.team?.name)
                      .filter(Boolean) || []
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
          data={
            user?.parent?.children?.map((c: any) => ({
              label: `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim(),
              value: `#${c.jerseyNum}`,
              fullWidth: true,
              player: c,
              onEdit: () => setEditPlayerId(c.id),
              onRemove: () => setRemovePlayerId(c.id),
            })) || []
          }
          onSelectPlayer={(p: any) => setSelectedProfile(p)}
        />
      </View>
    );
  }

  // Default: Info/Team view
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

      {teams.map((team: any) => {
        const data: Record<typeof view, CardItem[]> = {
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
              onRemove: () =>
                setRemoveCoachId({ coachId: c.id, teamId: team.id }),
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

        const items = data[view];

        return (
          <View key={team.id} style={styles.tableSection}>
            <Text style={styles.teamTitle}>{team.name}</Text>
            {view === 'trophies' && (
              <View style={{ marginBottom: 12 }}>
                <CustomButton
                  title="+ Add Trophy"
                  onPress={() => setAddTrophy(team.id)}
                />
              </View>
            )}

            {items.length > 0 ? (
              <RenderCards
                data={items}
                onSelectPlayer={(p: any) => setSelectedProfile(p)}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {view === 'roster'
                    ? 'No players yet.'
                    : view === 'staff'
                      ? 'No staff assigned.'
                      : 'No trophies on record.'}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
