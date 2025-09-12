// components/TeamRosterModal.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import { GlobalColors } from '@/constants/Colors';
import type { UserFE } from '@bomber-app/database';
import { formatAgeGroup } from '@/utils/enumOptions';
import { formatPosition } from '@/utils/positions';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  user: UserFE;
};

export default function TeamRosterModal({ isVisible, onClose, user }: Props) {
  // Build a unified list of "my teams" from any role the user might have.
  const teams = useMemo(() => {
    const coachTeams =
      user.coach?.teams?.map((t) => ({ ...t, _source: 'coach' })) ?? [];
    const headTeams =
      user.coach?.headTeams?.map((t) => ({ ...t, _source: 'headCoach' })) ?? [];
    const playerTeam = user.player?.team
      ? [{ ...user.player.team, _source: 'player' }]
      : [];
    const regTeams =
      user.regCoach?.teams?.map((t) => ({ ...t, _source: 'regCoach' })) ?? [];
    const parentTeams =
      user.parent?.children
        ?.map((c) => c.team)
        .filter(Boolean)
        .map((t) => ({ ...t, _source: 'parent' })) ?? [];

    // De‑dupe by team id
    const map = new Map<number, any>();
    [
      ...coachTeams,
      ...headTeams,
      ...playerTeam,
      ...regTeams,
      ...parentTeams,
    ].forEach((t) => {
      if (!t) return;
      map.set(t.id, t);
    });
    return Array.from(map.values());
  }, [user]);

  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeTeamId) ?? teams[0],
    [teams, activeTeamId]
  );

  return (
    <FullScreenModal isVisible={isVisible} onClose={onClose} title="My Teams">
      {teams.length === 0 ? (
        <Text style={styles.empty}>No teams found.</Text>
      ) : (
        <View style={{ gap: 16 }}>
          {/* Team chips */}
          <FlatList
            horizontal
            data={teams}
            keyExtractor={(t) => String(t.id)}
            contentContainerStyle={{ paddingVertical: 4 }}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            renderItem={({ item }) => {
              const active = (activeTeam?.id ?? -1) === item.id;
              return (
                <TouchableOpacity
                  onPress={() => setActiveTeamId(item.id)}
                  style={[styles.teamChip, active && styles.teamChipActive]}
                >
                  <Text
                    style={[
                      styles.teamChipText,
                      active && styles.teamChipTextActive,
                    ]}
                  >
                    {item.name} • {formatAgeGroup(item.ageGroup)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Staff */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Staff</Text>
            <View style={{ gap: 8 }}>
              {activeTeam?.headCoach ? (
                <Row
                  left="Head Coach"
                  right={`${activeTeam.headCoach.user?.fname ?? ''} ${activeTeam.headCoach.user?.lname ?? ''}`.trim()}
                />
              ) : null}
              {(activeTeam?.coaches ?? [])
                .filter((c: any) => c?.id !== activeTeam?.headCoach?.id)
                .map((c: any) => (
                  <Row
                    key={`coach-${c.id}`}
                    left="Assistant Coach"
                    right={`${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim()}
                  />
                ))}
            </View>
          </View>

          {/* Roster */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Roster</Text>
            {!activeTeam?.players || activeTeam.players.length === 0 ? (
              <Text style={styles.muted}>No players yet.</Text>
            ) : (
              <FlatList
                data={activeTeam.players}
                keyExtractor={(p: any) => String(p.id)}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item: p }: any) => {
                  const name =
                    `${p.user?.fname ?? ''} ${p.user?.lname ?? ''}`.trim();
                  const jersey = p.jerseyNum ? `#${p.jerseyNum}` : '';
                  const pos = [formatPosition(p.pos1), formatPosition(p.pos2)]
                    .filter(Boolean)
                    .join(' / ');
                  const commit = p.commit?.name ? ` • ${p.commit.name}` : '';
                  return (
                    <View style={styles.rosterRow}>
                      <Text style={styles.rosterName}>{name}</Text>
                      <Text style={styles.rosterMeta}>
                        {jersey} {pos}
                        {commit}
                      </Text>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      )}
    </FullScreenModal>
  );
}

function Row({ left, right }: { left: string; right?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.left}>{left}</Text>
      <Text style={styles.right}>{right ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: '#ccc', textAlign: 'center', paddingVertical: 16 },
  teamChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  teamChipActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  teamChipText: { color: '#dfe3ef', fontWeight: '600' },
  teamChipTextActive: { color: '#fff' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  cardTitle: {
    color: GlobalColors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  muted: { color: '#A9A9B6' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { color: '#EDEDF2', fontSize: 14, flexShrink: 1 },
  right: { color: '#A9A9B6', fontSize: 14, textAlign: 'right', flexShrink: 1 },

  rosterRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rosterName: { color: GlobalColors.white, fontWeight: '600' },
  rosterMeta: { color: '#A9A9B6', marginTop: 2 },
});
