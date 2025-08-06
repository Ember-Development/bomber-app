import { Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function TabButton({ label, active, onPress }: TabButtonProps) {
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

const styles = StyleSheet.create({
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 6,
  },
  tabButtonActive: {
    backgroundColor: '#111',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
});
