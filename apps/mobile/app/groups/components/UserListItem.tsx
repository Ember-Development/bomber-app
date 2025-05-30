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
        style={{ flex: 1 }}
        onPress={() => onToggle(user.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.userName}>
          {user.fname} {user.lname}
        </Text>
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
  userName: {
    fontSize: 16,
    flex: 1,
    color: GlobalColors.white,
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
    borderColor: GlobalColors.white,
  },
  removeButton: {
    backgroundColor: '#dc3545',
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
