import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GlobalColors } from '@/constants/Colors';
import { useUnassignedPlayers } from '@/hooks/teams/useTeams';
import { useAddPlayerToTeam } from '@/hooks/teams/usePlayerById';
import { POSITION_DISPLAY, POSITION_SHORT } from '@/utils/enumOptions';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import CustomButton from '@/components/ui/atoms/Button';

const AGE_GROUPS = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'ALUMNI'] as const;

export default function BomberPortal() {
  const router = useRouter();

  // search with debounce (no external deps)
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchInput]);

  const [ageGroup, setAgeGroup] = useState<string | undefined>(undefined);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useUnassignedPlayers({ search, ageGroup, pageSize: 20 });

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data]
  );

  // assign-to-team modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { mutate: addToTeam, isPending: assigning } = useAddPlayerToTeam({
    onSuccess: () => {
      setShowAssignModal(false);
      setTeamCode('');
      setSelectedPlayerId(null);
      refetch();
    },
  });

  const openAssign = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setShowAssignModal(true);
  };

  const submitAssign = () => {
    if (!selectedPlayerId || !teamCode.trim()) return;
    addToTeam({ playerId: selectedPlayerId, teamCode: teamCode.trim() });
  };

  // parent modal
  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [parentModalData, setParentModalData] = useState<any[]>([]);
  const [parentModalPlayer, setParentModalPlayer] = useState<any | null>(null);

  const openParentModal = (player: any) => {
    const parents = Array.isArray(player?.parents) ? player.parents : [];
    setParentModalData(parents);
    setParentModalPlayer(player);
    setParentModalOpen(true);
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bomber Portal</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#fff" />
          <TextInput
            placeholder="Search players by name or jersey #"
            placeholderTextColor="#fff"
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchInput('');
                setSearch('');
              }}
            >
              <Ionicons name="close-circle" size={18} color="#8E8E99" />
            </TouchableOpacity>
          )}
        </View>

        {/* Age filter chips */}
        <View style={styles.ageRow}>
          <FilterChip
            label="All"
            active={!ageGroup}
            onPress={() => setAgeGroup(undefined)}
          />
          {AGE_GROUPS.map((ag) => (
            <FilterChip
              key={ag}
              label={ag}
              active={ageGroup === ag}
              onPress={() => setAgeGroup(ag)}
            />
          ))}
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.hint}>Loading unassigned players…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle" size={28} color="#FCA5A5" />
            <Text style={styles.hint}>Failed to load players.</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={[styles.btn, styles.btnGhost, { marginTop: 8 }]}
            >
              <Text style={styles.btnGhostText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            initialNumToRender={12}
            windowSize={7}
            removeClippedSubviews
            onEndReachedThreshold={0.5}
            onEndReached={() =>
              hasNextPage && !isFetchingNextPage && fetchNextPage()
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="checkmark-circle" size={32} color="#7DDC86" />
                <Text style={styles.hint}>No unassigned players found.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <PlayerCard
                player={item}
                onAssign={() => openAssign(item.id)}
                onShowParents={() => openParentModal(item)}
              />
            )}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: 16 }}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />
        )}

        {/* Assign Modal */}
        <Modal visible={showAssignModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Player to Team</Text>
              <Text style={styles.modalSubtitle}>Enter team invite code:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. BOMBER-2025"
                placeholderTextColor="#8E8E99"
                value={teamCode}
                onChangeText={setTeamCode}
                autoCapitalize="characters"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => setShowAssignModal(false)}
                  disabled={assigning}
                >
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={submitAssign}
                  disabled={assigning || !teamCode.trim()}
                >
                  <Text style={styles.btnPrimaryText}>
                    {assigning ? 'Assigning…' : 'Add to Team'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Parent Contact Modal */}
        <Modal
          visible={parentModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setParentModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                Parent Contact{' '}
                {parentModalPlayer ? `– ${safeName(parentModalPlayer)}` : ''}
              </Text>
              {isUnder14(parentModalPlayer?.ageGroup) ? (
                <View style={styles.notice}>
                  <Ionicons name="shield-checkmark" size={16} color="#7DDC86" />
                  <Text style={styles.noticeText}>
                    COPPA: Parent is primary contact for 14U and under
                  </Text>
                </View>
              ) : null}

              {parentModalData.length === 0 ? (
                <Text style={styles.hint}>
                  No parent linked to this player.
                </Text>
              ) : (
                parentModalData.map((p, idx) => {
                  const uf = p?.user?.fname ?? '—';
                  const ul = p?.user?.lname ?? '';
                  const email = p?.user?.email;
                  const phone = p?.user?.phone;
                  const addr = p?.address
                    ? `${p.address.address1 ?? ''}${p.address.address2 ? ' ' + p.address.address2 : ''}, ${p.address.city ?? ''}, ${p.address.state ?? ''} ${p.address.zip ?? ''}`
                    : undefined;

                  return (
                    <View key={idx} style={styles.parentRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.parentName}>
                          {`${uf} ${ul}`.trim()}
                        </Text>
                        {email ? (
                          <Text style={styles.parentMeta}>
                            Email: <Text style={styles.dim}>{email}</Text>
                          </Text>
                        ) : null}
                        {phone ? (
                          <Text style={styles.parentMeta}>
                            Phone: <Text style={styles.dim}>{phone}</Text>
                          </Text>
                        ) : null}
                        {addr ? (
                          <Text
                            style={[styles.parentMeta, { marginTop: 2 }]}
                            numberOfLines={2}
                          >
                            Addr: <Text style={styles.dim}>{addr}</Text>
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.parentActions}>
                        {phone ? (
                          <>
                            <IconBtn
                              icon="call"
                              onPress={() => Linking.openURL(`tel:${phone}`)}
                            />
                            <IconBtn
                              icon="chatbubble"
                              onPress={() => Linking.openURL(`sms:${phone}`)}
                            />
                          </>
                        ) : null}
                        {email ? (
                          <IconBtn
                            icon="mail"
                            onPress={() => Linking.openURL(`mailto:${email}`)}
                          />
                        ) : null}
                      </View>
                    </View>
                  );
                })
              )}

              <View style={[styles.modalActions, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => setParentModalOpen(false)}
                >
                  <Text style={styles.btnGhostText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

/* --- UI bits --- */

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function IconBtn({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn}>
      <Ionicons name={icon} size={18} color="#fff" />
    </TouchableOpacity>
  );
}

function safeName(player: any) {
  return `${player?.user?.fname ?? '—'} ${player?.user?.lname ?? ''}`.trim();
}

function isUnder14(ageGroup?: string) {
  return (
    ageGroup === 'U8' ||
    ageGroup === 'U10' ||
    ageGroup === 'U12' ||
    ageGroup === 'U14'
  );
}

/** HORIZONTAL (compact) CARD */
function PlayerCard({
  player,
  onAssign,
  onShowParents,
}: {
  player: any; // PlayerFE
  onAssign: () => void;
  onShowParents: () => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const name = safeName(player);
  const jersey = player?.jerseyNum ? `#${player.jerseyNum}` : '—';
  const pos = [player?.pos1, player?.pos2]
    .filter(Boolean)
    .map((p: string) =>
      compact ? (POSITION_SHORT[p] ?? p) : (POSITION_SHORT[p] ?? p)
    )
    .join(' / ');
  const grad = player?.gradYear ?? '—';
  const age = player?.ageGroup ?? '—';
  const email = player?.user?.email;
  const hasParents =
    Array.isArray(player?.parents) && player.parents.length > 0;

  const commitUrl =
    player?.commit?.imageUrl || player?.user?.commit?.imageUrl || null;

  return (
    <View style={styles.card}>
      {/* Left column */}
      <View style={styles.cardLeft}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {name || 'Unknown Player'}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{jersey}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Meta label="Pos" value={pos || '—'} />
          <Meta label="Age" value={age} />
          <Meta label="Grad" value={grad} />
        </View>
        {email ? (
          <Text style={styles.cardEmail} numberOfLines={1}>
            {email}
          </Text>
        ) : null}
        {isUnder14(age) && hasParents ? (
          <View style={styles.reqRow}>
            <Ionicons name="shield-checkmark" size={14} color="#7DDC86" />
            <Text style={styles.reqText}>Parent contact required</Text>
          </View>
        ) : null}
      </View>

      {/* Right column (actions) */}
      <View style={styles.cardRight}>
        {hasParents ? (
          <TouchableOpacity
            style={[styles.chipAction, styles.chipParent]}
            onPress={onShowParents}
          >
            <Ionicons name="people" size={16} color="#EAB308" />
            <Text style={[styles.chipActionText, { color: '#EAB308' }]}>
              Parents
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.chipAction, styles.chipDisabled]}>
            <Ionicons name="people" size={16} color="#8E8E99" />
            <Text style={[styles.chipActionText, { color: '#8E8E99' }]}>
              No Parent
            </Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          {commitUrl ? (
            <Image
              source={{ uri: commitUrl }}
              style={styles.commitAvatar}
              resizeMode="contain"
            />
          ) : null}

          <CustomButton
            variant="icon"
            iconName="add-circle"
            title="Add to Team"
            onPress={onAssign}
          />
        </View>
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* --- Styles --- */

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.select({ ios: 8, android: 12 }),
    paddingBottom: 8,
  },
  backButton: { padding: 8, marginRight: 6 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },

  searchWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },

  ageRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipText: { color: '#C8C8D2', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  hint: { color: '#A9A9B6', fontSize: 13 },

  /** HORIZONTAL CARD LAYOUT */
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardLeft: { flex: 1, paddingRight: 10 },
  cardRight: {
    width: 136,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', flexShrink: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  metaPill: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  metaLabel: { color: '#C8C8D2', fontSize: 11, fontWeight: '700' },
  metaValue: { color: '#fff', fontSize: 11, maxWidth: 90 },

  cardEmail: { color: '#EDEDF2', fontSize: 12 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  reqText: { color: '#7DDC86', fontSize: 12, fontWeight: '700' },

  chipAction: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipParent: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
  chipActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chipDisabled: { opacity: 0.6 },

  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: GlobalColors?.bomber ?? '#3B82F6',
    marginTop: 8,
  },
  assignText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  /** Modals (shared) */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#111214',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    gap: 10,
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalSubtitle: { color: '#B8B8C3', fontSize: 12 },
  modalInput: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  btnGhost: { backgroundColor: 'transparent' },
  btnGhostText: { color: '#B8B8C3', fontWeight: '700' },
  btnPrimary: { backgroundColor: GlobalColors?.bomber ?? '#3B82F6' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(125,220,134,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(125,220,134,0.35)',
    marginTop: 6,
  },
  noticeText: {
    color: '#7DDC86',
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },

  /** Parent modal rows */
  parentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  parentName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  parentMeta: { color: '#EDEDF2', fontSize: 12 },
  dim: { color: '#A9A9B6' },
  parentActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  commitAvatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
