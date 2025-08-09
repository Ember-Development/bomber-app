import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { PublicUserFE } from '@bomber-app/database';
import { GlobalColors } from '@/constants/Colors';

interface Props {
  user: PublicUserFE;
  isSelected: boolean;
  onToggle: (userId: string) => void;
}

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const UserListItem: React.FC<Props> = ({ user, isSelected, onToggle }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 0.95 : 1);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.userRow, animatedStyle]}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => onToggle(user.id)}
        activeOpacity={0.8}
      >
        <View style={styles.nameRoleContainer}>
          <Text style={styles.userName}>
            {user.fname} {user.lname}
          </Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>
              {capitalize(user.primaryRole.replace('_', ' '))}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onToggle(user.id)}
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
};

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  nameRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    color: GlobalColors.white,
  },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.10)',
    borderColor: 'rgba(255, 0, 0, 0.25)',
  },
  addText: {
    color: GlobalColors.bomber,
  },
  removeText: {
    color: 'white',
  },
  statusButtonText: {
    fontWeight: 'bold',
  },
});

export default React.memo(UserListItem);
