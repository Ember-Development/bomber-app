import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

interface FilterChipsProps {
  selected: string;
  options: string[];
  onSelect: (value: string) => void;
}

export default function FilterChips({
  selected,
  options,
  onSelect,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipContainer}
    >
      {options.map((opt) => {
        const isActive = opt === selected;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, isActive && styles.activeChip]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.chipText, isActive && styles.activeChipText]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeChip: {
    backgroundColor: '#111',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
