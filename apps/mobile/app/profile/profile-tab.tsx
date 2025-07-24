import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatGearLabel, formatLabel } from '@/utils/formatDisplay';
import { useNormalizedUser } from '@/utils/user';
import { PlayerFE, TeamFE } from '@bomber-app/database';
import { GlobalColors } from '@/constants/Colors';
import EditPlayerModal from './components/update-player';
import RemovePlayerModal from './components/remove-player';
import { usePlayerById } from '@/hooks/teams/usePlayerById';
import { useDeletePlayer } from '@/hooks/teams/usePlayerById';

interface GlassCardProps {
  label: string;
  value: string;
  isFullWidth?: boolean;
}

function GlassCard({ label, value, isFullWidth = false }: GlassCardProps) {
  return (
    <View style={[styles.card, isFullWidth && styles.fullWidthCard]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function ProfileTabs() {
  const { user, primaryRole } = useNormalizedUser();
  const isCoach = primaryRole === 'COACH';
  const isParent = primaryRole === 'PARENT';
  const isFan = primaryRole === 'FAN';

  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'gear'>(
    isFan ? 'contact' : isCoach ? 'contact' : 'info'
  );
  const [view, setView] = useState('roster');
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [removePlayerId, setRemovePlayerId] = useState<string | null>(null);
  const { data: selectedPlayer } = usePlayerById(editPlayerId ?? '');
  const { data: selectedPlayerToRemove } = usePlayerById(removePlayerId ?? '');

  const renderCards = (
    data: {
      label: string;
      value: string | null | undefined;
      fullWidth?: boolean;
    }[]
  ) => {
    const processed = data.map((item) => ({
      ...item,
      value: formatLabel(item.value) || 'N/A',
    }));

    return (
      <View style={styles.grid}>
        {processed.map((item) => (
          <GlassCard
            key={item.label}
            label={item.label}
            value={item.value}
            isFullWidth={item.fullWidth}
          />
        ))}
      </View>
    );
  };

  const renderTeamTabs = () => {
    const teams = user?.coach?.teams || [];

    return (
      <View style={{ marginTop: 24 }}>
        <View style={styles.teamTabRow}>
          {['roster', 'staff', 'trophies'].map((key) => (
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

        {teams.map((team: TeamFE) => (
          <View key={team.id} style={styles.tableSection}>
            <Text style={styles.teamTitle}>{team.name}</Text>

            {view === 'roster' && team.players?.length ? (
              team.players.map((p) => (
                <View key={p.id} style={styles.rowLarge}>
                  <View style={styles.rowContent}>
                    <Text style={styles.cellLarge}>
                      {p.user?.fname} {p.user?.lname}
                    </Text>
                    <Text style={styles.cellLarge}>#{p.jerseyNum}</Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => setEditPlayerId(p.id)}>
                      <Text style={styles.action}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRemovePlayerId(p.id)}>
                      <Text style={styles.actionDelete}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : view === 'staff' && team.coaches?.length ? (
              team.coaches.map((c) => (
                <View key={c.id} style={styles.rowLarge}>
                  <View style={styles.rowContent}>
                    <Text style={styles.cellLarge}>
                      {c.user?.fname} {c.user?.lname}
                    </Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity>
                      <Text style={styles.action}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.actionDelete}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : view === 'trophies' && team.trophyCase?.length ? (
              team.trophyCase.map((t) => (
                <View key={t.id} style={styles.rowLarge}>
                  <View style={styles.rowContent}>
                    <Text style={styles.cellLarge}>{t.title}</Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity>
                      <Text style={styles.action}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.actionDelete}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No data available</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (isCoach) {
      switch (activeTab) {
        case 'contact':
          return renderCards([
            { label: 'Email', value: user?.email, fullWidth: true },
            { label: 'Phone', value: user?.phone, fullWidth: true },
            {
              label: 'Street Address',
              value: user?.coach?.address
                ? `${user.coach.address.address1} ${user.coach.address.address2 ?? ''}`.trim()
                : undefined,
              fullWidth: true,
            },
            {
              label: 'State',
              value: user?.coach?.address?.state,
              fullWidth: true,
            },
            { label: 'City', value: user?.coach?.address?.city },
            { label: 'Zipcode', value: user?.coach?.address?.zip },
          ]);
        case 'info':
          return (
            <>
              {renderCards([
                ...(user?.coach?.headTeams?.length
                  ? [
                      {
                        label: 'Head Coach Of',
                        value: user.coach.headTeams
                          .filter((t: TeamFE) => t.headCoach)
                          .map((t: TeamFE) => t.name)
                          .join(', '),
                        fullWidth: true,
                      },
                    ]
                  : []),
                {
                  label: 'Coaching On',
                  value:
                    user?.coach?.teams?.map((t: TeamFE) => t.name).join(', ') ||
                    'N/A',
                  fullWidth: true,
                },
              ])}
              {renderTeamTabs()}
            </>
          );
      }
    } else if (isParent) {
      switch (activeTab) {
        case 'contact':
          return renderCards([
            { label: 'Email', value: user?.email, fullWidth: true },
            { label: 'Phone', value: user?.phone, fullWidth: true },
            {
              label: 'Street Address',
              value: user?.parent?.address
                ? `${user.parent.address.address1} ${user.parent.address.address2 ?? ''}`.trim()
                : undefined,
              fullWidth: true,
            },
            {
              label: 'State',
              value: user?.parent?.address?.state,
              fullWidth: true,
            },
            { label: 'City', value: user?.parent?.address?.city },
            { label: 'Zipcode', value: user?.parent?.address?.zip },
          ]);
        case 'info':
          return (
            <View style={{ marginTop: 20 }}>
              {renderCards([
                {
                  label: 'Teams',
                  value:
                    [
                      ...new Set(
                        user?.parent?.children
                          ?.map((child: PlayerFE) => child.team?.name)
                          .filter(Boolean)
                      ),
                    ].join(', ') || 'N/A',
                  fullWidth: true,
                },
              ])}

              <Text style={styles.sectionTitle}>My Athletes</Text>

              {/* Player Rows */}
              {user?.parent?.children?.length ? (
                user.parent.children.map((child: PlayerFE) => (
                  <View key={child.id} style={styles.rowLarge}>
                    <View style={styles.rowContent}>
                      <View>
                        <Text style={styles.cellLarge}>
                          {child.user?.fname} {child.user?.lname}
                        </Text>
                        <Text style={styles.teamLabel}>
                          {child.team
                            ? `${child.team.name} • ${child.team.ageGroup} • ${child.team.region}`
                            : 'No team assigned'}
                        </Text>
                      </View>
                      <Text style={styles.cellLarge}>#{child.jerseyNum}</Text>
                    </View>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={() => setEditPlayerId(child.id)}
                      >
                        <Text style={styles.action}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setRemovePlayerId(child.id)}
                      >
                        <Text style={styles.actionDelete}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>
                  No players linked to this account.
                </Text>
              )}
            </View>
          );
      }
    } else {
      switch (activeTab) {
        case 'info':
          return renderCards([
            { label: 'Team', value: user?.player?.team?.name, fullWidth: true },
            { label: 'Grad Year', value: user?.player?.gradYear },
            { label: 'Age Group', value: user?.player?.ageGroup },
            { label: 'Pos 1', value: user?.player?.pos1 },
            { label: 'Pos 2', value: user?.player?.pos2 },
            {
              label: 'College Commitment',
              value: user?.player?.college,
              fullWidth: true,
            },
          ]);
        case 'contact':
          return renderCards([
            { label: 'Email', value: user?.email, fullWidth: true },
            { label: 'Phone', value: user?.phone },
            { label: 'Date of Birth', value: user?.player?.dob },
            {
              label: 'Street Address',
              value: user?.player?.address
                ? `${user.player.address.address1} ${user.player.address.address2 ?? ''}`.trim()
                : undefined,
              fullWidth: true,
            },
            {
              label: 'State',
              value: user?.player?.address?.state,
              fullWidth: true,
            },
            { label: 'City', value: user?.player?.address?.city },
            { label: 'Zipcode', value: user?.player?.address?.zip },
          ]);
        case 'gear':
          const gearItems = [
            {
              label: 'Jersey Size',
              value: formatGearLabel(user?.player?.jerseySize),
            },
            {
              label: 'Pant Size',
              value: formatGearLabel(user?.player?.pantSize),
            },
            {
              label: 'Stirrup Size',
              value: formatGearLabel(user?.player?.stirrupSize),
            },
            {
              label: 'Short Size',
              value: formatGearLabel(user?.player?.shortSize),
            },
            {
              label: 'Practice Short Size',
              value: formatGearLabel(user?.player?.practiceShortSize),
            },
          ];

          if (gearItems.length % 2 !== 0)
            gearItems[gearItems.length - 1].fullWidth = true;

          return renderCards(gearItems);
      }
    }

    return null;
  };

  return (
    <>
      <View>
        {!isFan && (
          <View style={styles.floatingTabsContainer}>
            <TabButton
              label={isCoach ? 'Team' : 'Info'}
              active={activeTab === 'info'}
              onPress={() => setActiveTab('info')}
            />
            <TabButton
              label="Contact"
              active={activeTab === 'contact'}
              onPress={() => setActiveTab('contact')}
            />
            {!isCoach && !isParent && (
              <TabButton
                label="Gear"
                active={activeTab === 'gear'}
                onPress={() => setActiveTab('gear')}
              />
            )}
          </View>
        )}
        {renderContent()}
      </View>

      {/* Modals */}
      {editPlayerId && selectedPlayer && (
        <EditPlayerModal
          visible={!!editPlayerId}
          player={selectedPlayer}
          onClose={() => setEditPlayerId(null)}
        />
      )}
      {removePlayerId && selectedPlayerToRemove && (
        <RemovePlayerModal
          visible={!!removePlayerId}
          playerName={`${selectedPlayerToRemove.user?.fname} ${selectedPlayerToRemove.user?.lname}`}
          onClose={() => setRemovePlayerId(null)}
          onConfirm={() => {
            useDeletePlayer(removePlayerId);
            setRemovePlayerId(null);
          }}
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
    color: '#ccc',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 16,
  },
  card: {
    width: '47%',
    minHeight: 100,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fullWidthCard: {
    width: '100%',
  },
  cardLabel: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  teamTabRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  teamTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.16)',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
  },
  cell: {
    color: '#eee',
    fontSize: 14,
    flex: 1,
  },
  empty: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  rowLarge: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  teamLabel: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
});
