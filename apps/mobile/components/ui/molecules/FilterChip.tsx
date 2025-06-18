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
    paddingHorizontal: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  activeChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  chipText: {
    fontSize: 14,
    color: '#ccc',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
});
