import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PublicUserFE } from '@bomber-app/database';
import UserListItem from './UserListItem';
import { GlobalColors } from '@/constants/Colors';

interface UserListProps {
  users: PublicUserFE[];
  selectedUsers: string[];
  onToggleUser: (userId: string) => void;
  onSelectAll: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUsers,
  onToggleUser,
  onSelectAll,
}) => {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <TouchableOpacity style={styles.selectAllButton} onPress={onSelectAll}>
          <Text style={styles.buttonText}>
            {selectedUsers.length === users.length
              ? 'Deselect All'
              : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      {users.map((user) => (
        <UserListItem
          key={user.id}
          user={user}
          isSelected={selectedUsers.includes(user.id)}
          onToggle={onToggleUser}
        />
      ))}
    </View>
  );
};

export default UserList;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GlobalColors.bomber,
  },
  selectAllButton: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
