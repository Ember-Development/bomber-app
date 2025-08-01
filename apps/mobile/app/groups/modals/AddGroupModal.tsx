import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import FullsheetModal from '../../../components/ui/organisms/FullSheetModal';
import Checkbox from '../../../components/ui/atoms/Checkbox';
import CustomSelect from '../../../components/ui/atoms/dropdown';
import SearchField from '../../../components/ui/atoms/Search';
import Separator from '../../../components/ui/atoms/Seperator';
import { useUsers } from '@/hooks/useUser';
import { Position, PublicUserFE, TeamFE } from '@bomber-app/database';
import CustomButton from '../../../components/ui/atoms/Button';
import { useAddUsersToGroup } from '@/hooks/groups/useChats';
import UserList from '../components/UserList';
import { GlobalColors } from '@/constants/Colors';
import { useNormalizedUser } from '@/utils/user';
import { useUserPermissions } from '@/hooks/useUserPermission';

interface CreateGroupModalProps {
  visible: boolean;
  groupName: string;
  onClose: () => void;
  onCreate: (selectedUsers: string[]) => void;
  existingGroupUserIds: string[];
  isEditMode?: boolean;
  groupId?: string;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  groupName: initialGroupName,
  onClose,
  onCreate,
  existingGroupUserIds = [],
  isEditMode = false,
  groupId,
}) => {
  const [groupName, setGroupName] = useState(initialGroupName);
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    team: '',
    ageDivision: '',
    position: '',
  });
  const [checkboxes, setCheckboxes] = useState({
    all: true,
    players: false,
    coaches: false,
    parents: false,
    pitchers: false,
    admin: false,
    regional_coaches: false,
  });
  const { data: AllUsers = [] } = useUsers();
  const { mutate: mutateAddToGroup } = useAddUsersToGroup();

  const scrollViewRef = useRef<ScrollView>(null);

  const handleScrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // const users: PublicUserFE[] = useMemo(() => AllUsers, [AllUsers]);
  const { user } = useNormalizedUser();
  const { can } = useUserPermissions();

  const isAdmin = user?.primaryRole === 'ADMIN';
  const isRegionalCoach = user?.primaryRole === 'REGIONAL_COACH';

  const users: PublicUserFE[] = useMemo(() => {
    if (!user || !user.primaryRole) return [];

    // 1. ADMIN sees everyone
    if (user.primaryRole === 'ADMIN') {
      return AllUsers;
    }

    // 2. REGIONAL_COACH sees everyone in their region
    //    —and if they also have a coach profile, anyone on their coached teams.
    if (user.primaryRole === 'REGIONAL_COACH') {
      const region = user.regCoach?.region;
      const coachTeamIds = user.coach?.teams.map((t: TeamFE) => t.id) ?? [];

      return AllUsers.filter((u) => {
        // region membership
        const playerRegion = u.player?.team?.region;
        const coachRegion = u.coach?.teams?.[0]?.region;
        const parentRegion = u.parent?.children?.[0]?.team?.region;
        const inRegion =
          playerRegion === region ||
          coachRegion === region ||
          parentRegion === region;

        // coach-of-team membership
        let inCoachTeam = false;
        if (coachTeamIds.length > 0) {
          const playerTeamId = u.player?.team?.id;
          const coachTeamIdsOfUser = u.coach?.teams.map((t) => t.id) ?? [];
          const parentChildTeamIds =
            u.parent?.children.map((ch) => ch.team?.id) ?? [];

          const parentOnCoachTeam = parentChildTeamIds.some((tid: any) =>
            tid ? coachTeamIds.includes(tid) : false
          );

          inCoachTeam =
            (playerTeamId ? coachTeamIds.includes(playerTeamId) : false) ||
            coachTeamIdsOfUser.some((tid) => coachTeamIds.includes(tid)) ||
            parentOnCoachTeam;
        }

        return inRegion || inCoachTeam;
      });
    }

    // 3. COACH sees players, coaches, parents on their teams
    if (user.primaryRole === 'COACH') {
      const coachTeamIds = user.coach?.teams.map((t: TeamFE) => t.id) ?? [];

      return AllUsers.filter((u) => {
        const playerTeamId = u.player?.team?.id;
        const coachTeamIdsOfUser = u.coach?.teams.map((t) => t.id) ?? [];
        const parentChildTeamIds =
          u.parent?.children.map((ch: { team: { id: any } }) => ch.team?.id) ??
          [];

        const parentOnCoachTeam = parentChildTeamIds.some((tid: any) =>
          tid ? coachTeamIds.includes(tid) : false
        );

        return (
          (playerTeamId ? coachTeamIds.includes(playerTeamId) : false) ||
          coachTeamIdsOfUser.some((tid) => coachTeamIds.includes(tid)) ||
          parentOnCoachTeam
        );
      });
    }

    return [];
  }, [AllUsers, user]);

  const teamNames = Array.from(
    new Set(
      users
        .filter((user) => user.player?.team)
        .map((user) => user.player!.team!.name)
    )
  );

  const teamOptions = teamNames.map((name) => ({
    label: name,
    value: name,
  }));

  const filteredUsers = users.filter((user) => {
    if (existingGroupUserIds.includes(user.id)) return false;

    // Search
    const matchesSearch =
      user.fname.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lname.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    // Role Checkboxes
    if (!checkboxes.all) {
      if (checkboxes.players && user.primaryRole !== 'PLAYER') return false;
      if (checkboxes.coaches && user.primaryRole !== 'COACH') return false;
      if (checkboxes.parents && user.primaryRole !== 'PARENT') return false;
      if (checkboxes.admin && user.primaryRole !== 'ADMIN') return false;
      if (checkboxes.regional_coaches && user.primaryRole !== 'REGIONAL_COACH')
        return false;
      if (checkboxes.pitchers) {
        if (user.primaryRole !== 'PLAYER') return false;

        if (
          user.player?.pos1 !== 'PITCHER' &&
          user.player?.pos2 !== 'PITCHER'
        ) {
          return false;
        }
      }
    }

    // Team filter
    if (filters.team && user.player?.team?.name !== filters.team) return false;

    // Age Division filter
    if (filters.ageDivision && user.player?.ageGroup !== filters.ageDivision)
      return false;

    // Position filter
    if (filters.position && user.player) {
      const { pos1, pos2 } = user.player;
      if (pos1 !== filters.position && pos2 !== filters.position) {
        return false;
      }
    }

    return true;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCheckboxChange = (
    type: keyof typeof checkboxes,
    checked: boolean
  ) => {
    if (type === 'all' && checked) {
      setCheckboxes({
        all: true,
        players: false,
        coaches: false,
        parents: false,
        pitchers: false,
        regional_coaches: false,
        admin: false,
      });
    } else {
      setCheckboxes((prev) => ({
        ...prev,
        [type]: checked,
        ...(type !== 'all' ? { all: false } : {}),
      }));
    }
  };

  const handleSelectAll = () => {
    const filteredIds = filteredUsers.map((user) => user.id.toString());
    if (selectedUsers.length === filteredIds.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredIds);
    }
  };

  return (
    <FullsheetModal
      isVisible={visible}
      onClose={onClose}
      title="Add Participants"
    >
      <View style={styles.container}>
        <View style={styles.fixedHeader}>
          {/* Counter */}
          <View style={styles.topSection}>
            <Text style={styles.counter}>
              {selectedUsers.length} Added to {groupName}
            </Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setFilters({
                  team: '',
                  ageDivision: '',
                  position: '',
                });
                setCheckboxes({
                  all: true,
                  players: false,
                  coaches: false,
                  parents: false,
                  pitchers: false,
                  admin: false,
                  regional_coaches: false,
                });
                setSearchText('');
              }}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <SearchField
            onSearch={(query) => setSearchText(query)}
            placeholder="Search users..."
          />

          {/* Filters */}
          <View style={styles.gridContainer}>
            {(isAdmin || isRegionalCoach) && (
              <View style={styles.gridItem}>
                <CustomSelect
                  label="Select Team"
                  options={teamOptions}
                  onSelect={(value) =>
                    setFilters((prev) => ({ ...prev, team: value }))
                  }
                />
              </View>
            )}

            {(isAdmin || isRegionalCoach) && (
              <View style={styles.gridItem}>
                <CustomSelect
                  label="Age Division"
                  options={[
                    { label: 'U8', value: 'U8' },
                    { label: 'U10', value: 'U10' },
                    { label: 'U12', value: 'U12' },
                    { label: 'U14', value: 'U14' },
                    { label: 'U16', value: 'U16' },
                    { label: 'U18', value: 'U18' },
                    { label: 'Alumni', value: 'ALUMNI' },
                  ]}
                  onSelect={(value) =>
                    setFilters((prev) => ({ ...prev, ageDivision: value }))
                  }
                />
              </View>
            )}
            <View style={styles.gridItem}>
              <CustomSelect
                label="Position"
                options={Object.values(Position).map((pos) => ({
                  label: pos,
                  value: pos,
                }))}
                onSelect={(value) =>
                  setFilters((prev) => ({ ...prev, position: value }))
                }
              />
            </View>
          </View>

          {/* Checkboxes */}
          {(isAdmin || isRegionalCoach || user?.primaryRole === 'COACH') && (
            <View style={styles.gridContainer}>
              {[
                ...(isAdmin
                  ? [
                      { label: 'All', type: 'all' },
                      { label: 'Admin', type: 'admin' },
                      { label: 'Coaches', type: 'coaches' },
                      { label: 'Regional Coaches', type: 'regional_coaches' },
                      { label: 'Players', type: 'players' },
                      { label: 'Parents', type: 'parents' },
                      { label: 'Pitchers Only', type: 'pitchers' },
                    ]
                  : [
                      { label: 'Players', type: 'players' },
                      { label: 'Coaches', type: 'coaches' },
                      { label: 'Parents', type: 'parents' },
                      { label: 'Pitchers Only', type: 'pitchers' },
                    ]),
              ].map(({ label, type }) => (
                <View key={type} style={styles.gridItem}>
                  <Checkbox
                    label={label}
                    checked={checkboxes[type as keyof typeof checkboxes]}
                    onChange={(checked) =>
                      handleCheckboxChange(
                        type as keyof typeof checkboxes,
                        checked
                      )
                    }
                  />
                </View>
              ))}
            </View>
          )}

          <Separator width="90%" color="#000" />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: 190 }}
          showsVerticalScrollIndicator={false}
        >
          <UserList
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onToggleUser={toggleUserSelection}
            onSelectAll={handleSelectAll}
          />
          <CustomButton
            title={isEditMode ? 'Add to Group' : 'Create Group'}
            onPress={() => {
              if (isEditMode && groupId) {
                mutateAddToGroup({ groupId, userIds: selectedUsers });
              } else {
                onCreate(selectedUsers);
              }
              setSelectedUsers([]);
            }}
            variant="primary"
          />
        </ScrollView>
      </View>
    </FullsheetModal>
  );
};

const styles = StyleSheet.create({
  container: {},
  fixedHeader: {
    paddingBottom: 5,
    paddingHorizontal: 10,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  counter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: GlobalColors.bomber,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridItem: {
    width: '48%',
  },
  scrollContainer: {
    flex: 1,
    minHeight: 400,
    marginHorizontal: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
      },
      default: {},
    }),

    alignItems: 'center',
    marginVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default CreateGroupModal;
