import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import FullsheetModal from '../ui/organisms/FullSheetModal';
import Checkbox from '../ui/atoms/Checkbox';
import CustomSelect from '../ui/atoms/dropdown';
import SearchField from '../ui/atoms/Search';
import Separator from '../ui/atoms/Seperator';
import { useUsers } from '@/hooks/useUser';
import { Position } from '@bomber-app/database';
import CustomButton from '../ui/atoms/Button';
import { useAddUsersToGroup } from '@/hooks/useChats';
import { UserForGroupModal } from '@/types';

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
  console.log('boi', AllUsers);
  const { mutate: mutateAddToGroup } = useAddUsersToGroup();

  const scrollViewRef = useRef<ScrollView>(null);

  const handleScrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const users: UserForGroupModal[] = useMemo(() => AllUsers, [AllUsers]);

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

          <SearchField
            onSearch={(query) => setSearchText(query)}
            placeholder="Search users..."
          />

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <CustomSelect
                label="Select Team"
                options={teamOptions}
                onSelect={(value) =>
                  setFilters((prev) => ({ ...prev, team: value }))
                }
              />
            </View>
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

          <View style={styles.gridContainer}>
            {[
              { label: 'All', type: 'all' },
              { label: 'Admin', type: 'admin' },
              { label: 'Coaches', type: 'coaches' },
              { label: 'Regional Coaches', type: 'regional_coaches' },
              { label: 'Players', type: 'players' },
              { label: 'Parents', type: 'parents' },
              { label: 'Pitchers Only', type: 'pitchers' },
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

          <Separator width="90%" color="#000" />
        </View>

        <View style={styles.scrollContainer}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.userListHeader}>
              <Text style={styles.usersTitle}>Users</Text>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={handleSelectAll}
              >
                <Text style={styles.buttonText}>
                  {selectedUsers.length === filteredUsers.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userRow}>
                <Text style={styles.userName}>
                  {user.fname} {user.lname}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    selectedUsers.includes(user.id)
                      ? styles.removeButton
                      : styles.addButton,
                  ]}
                  onPress={() => toggleUserSelection(user.id)}
                >
                  <Text style={styles.buttonText}>
                    {selectedUsers.includes(user.id) ? 'Remove' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

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
      </View>
    </FullsheetModal>
  );
};

const styles = StyleSheet.create({
  container: {},
  fixedHeader: {
    paddingBottom: 5,
    backgroundColor: 'white',
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
  userListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectAllButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
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
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  userName: {
    fontSize: 16,
    marginRight: 20,
    flex: 1,
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#007bff',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  clearButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
});

export default CreateGroupModal;
