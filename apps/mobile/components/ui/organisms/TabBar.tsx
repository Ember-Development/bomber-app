import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Dispatch, SetStateAction } from 'react';
import { styles } from '../../../styles/ProfileTabsStyle';
import { ProfileTab } from '../../../hooks/useProfileTabs';

export type TabItem = { key: ProfileTab; label: string };

export function TabBar({
  items,
  activeKey,
  onTabPress,
}: {
  items: TabItem[];
  activeKey: ProfileTab;
  onTabPress: Dispatch<SetStateAction<ProfileTab>>;
}) {
  return (
    <View style={styles.floatingTabsContainer}>
      {items.map((item) => (
        <TabButton
          key={item.key}
          label={item.label}
          active={activeKey === item.key}
          onPress={() => onTabPress(item.key)}
        />
      ))}
    </View>
  );
}

export function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
