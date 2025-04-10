import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { UserFE } from '@/types';

interface UserListProps {
  users: UserFE[];
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

      {users.map((user) => {
        const isSelected = selectedUsers.includes(user.id);

        const scale = useSharedValue(1);

        useEffect(() => {
          scale.value = withSpring(isSelected ? 0.95 : 1, {
            damping: 15,
            stiffness: 150,
          });
        }, [isSelected]);

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));

        return (
          <Animated.View key={user.id} style={[styles.userRow, animatedStyle]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => onToggleUser(user.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.userName}>
                {user.fname} {user.lname}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onToggleUser(user.id)}
              style={[
                styles.statusButton,
                isSelected ? styles.removeButton : styles.addButton,
              ]}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  isSelected ? styles.removeText : styles.addText,
                ]}
              >
                {isSelected ? 'Remove' : 'Add'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
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
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  userName: {
    fontSize: 16,
    flex: 1,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'black',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  addText: {
    color: 'black',
  },
  removeText: {
    color: 'white',
  },
  statusButtonText: {
    fontWeight: 'bold',
  },
});
