import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RenderCards, { CardItem } from '../components/render-content';
import CoachProfile from './CoachProfile';
import { styles } from '@/styles/ProfileTabsStyle';

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
}: any) {
  // 1️⃣ Contact
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

  // 2️⃣ Players (if also a parent)
  if (hasParentRecord && activeTab === 'players') {
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
          onSelectPlayer={(p) => setSelectedProfile(p)}
        />
      </View>
    );
  }

  // 3️⃣ Info (if they also coach, delegate)
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

  // 4️⃣ Region
  if (activeTab === 'region') {
    // drilling into one team
    if (selectedRegionTeamId) {
      const team = regionTeams.find((t: any) => t.id === selectedRegionTeamId);
      if (!team) return null;

      const tabs = ['roster', 'staff', 'trophies'] as const;
      const teamData: Record<typeof view, CardItem[]> = {
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

    // list of all region teams
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
          onPress={(label) => {
            const team = regionTeams.find((t: any) => t.name === label);
            if (team) setSelectedRegionTeamId(team.id);
          }}
        />
      </View>
    );
  }

  return null;
}
