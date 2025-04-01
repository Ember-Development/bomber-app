import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import ReusableModal from '../ui/organisms/BottomSheetModal';
import Checkbox from '../ui/atoms/Checkbox';
import CustomSelect from '../ui/atoms/dropdown';
import SearchField from '../ui/atoms/Search';
import Separator from '../ui/atoms/Seperator';
import { useUsers } from '@/hooks/useUser';
import { UserFE } from '@bomber-app/database';
import CustomButton from '../ui/atoms/Button';
import { addUsersToGroup } from '@/api/groups/groups';
import { useAddUsersToGroup } from '@/hooks/useChats';

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
    state: '',
  });
  const [checkboxes, setCheckboxes] = useState({
    all: true,
    players: false,
    coaches: false,
    pitchers: false,
  });
  const { data: AllUsers = [] } = useUsers();
  const { mutate: mutateAddToGroup } = useAddUsersToGroup();

  const scrollViewRef = useRef<ScrollView>(null);

  const handleScrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const users: UserFE[] = useMemo(() => AllUsers, [AllUsers]);

  // Filter users based on search input
  const filteredUsers = users.filter((user) =>
    `${user.id}}`.toLowerCase().includes(searchText.toLowerCase())
  );

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle Checkbox Change
  const handleCheckboxChange = (
    type: keyof typeof checkboxes,
    checked: boolean
  ) => {
    if (type === 'all' && checked) {
      setCheckboxes({
        all: true,
        players: false,
        coaches: false,
        pitchers: false,
      });
    } else {
      setCheckboxes((prev) => ({
        ...prev,
        [type]: checked,
        ...(type !== 'all' ? { all: false } : {}),
      }));
    }
  };

  // Select All / Deselect All Users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]); // Deselect all
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id)); // Select all
    }
  };

  return (
    <ReusableModal
      isVisible={visible}
      onClose={onClose}
      title="Add Participants"
      variant="full-screen"
    >
      <View style={styles.container}>
        <View style={styles.fixedHeader}>
          <View style={styles.topSection}>
            <Text style={styles.counter}>
              {selectedUsers.length} Added to {groupName}
            </Text>
          </View>

          <SearchField
            onSearch={(query) => setSearchText(query)}
            placeholder="Search users..."
          />

          {/* Filters (Fixed) */}
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <CustomSelect
                label="Select Team"
                options={[
                  { label: 'Team A', value: 'Team A' },
                  { label: 'Team B', value: 'Team B' },
                ]}
                onSelect={(value) =>
                  setFilters((prev) => ({ ...prev, team: value }))
                }
              />
            </View>
            <View style={styles.gridItem}>
              <CustomSelect
                label="Age Division"
                options={[
                  { label: 'U12', value: 'U12' },
                  { label: 'U14', value: 'U14' },
                ]}
                onSelect={(value) =>
                  setFilters((prev) => ({ ...prev, ageDivision: value }))
                }
              />
            </View>
            <View style={styles.gridItem}>
              <CustomSelect
                label="Position"
                options={[
                  { label: 'Pitcher', value: 'Pitcher' },
                  { label: 'Catcher', value: 'Catcher' },
                ]}
                onSelect={(value) =>
                  setFilters((prev) => ({ ...prev, position: value }))
                }
              />
            </View>
            <View style={styles.gridItem}>
              <CustomSelect
                label="State"
                options={[
                  { label: 'California', value: 'CA' },
                  { label: 'Texas', value: 'TX' },
                ]}
                onSelect={(value) =>
                  setFilters((prev) => ({ ...prev, state: value }))
                }
              />
            </View>
          </View>

          {/* Checkboxes (Fixed) */}
          <View style={styles.gridContainer}>
            {[
              { label: 'All', type: 'all' },
              { label: 'All Players', type: 'players' },
              { label: 'All Coaches', type: 'coaches' },
              { label: 'All Parents', type: 'parents' },
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

        {/* Scrollable Users */}
        <View style={styles.scrollContainer}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            onLayout={handleScrollToBottom}
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
            {filteredUsers.map((item) => (
              <View key={item.id} style={styles.userRow}>
                <Text style={styles.userName}>{item.id}</Text>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    selectedUsers.includes(item.id)
                      ? styles.removeButton
                      : styles.addButton,
                  ]}
                  onPress={() => toggleUserSelection(item.id)}
                >
                  <Text style={styles.buttonText}>
                    {selectedUsers.includes(item.id) ? 'Remove' : 'Add'}
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
    </ReusableModal>
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
    marginVertical: 10,
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
});

export default CreateGroupModal;
