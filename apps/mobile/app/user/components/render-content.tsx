import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlayerFE } from '@bomber-app/database';
import { GlobalColors } from '@/constants/Colors';

export interface CardItem {
  label: string;
  value: string;
  fullWidth?: boolean;
  player?: PlayerFE;
  onEdit?: () => void;
  onRemove?: () => void;
}

interface RenderCardsProps {
  data: CardItem[];
  onSelectPlayer?: (player: PlayerFE) => void;
  onPress?: (label: string) => void;
}

export default function RenderCards({
  data,
  onSelectPlayer,
  onPress,
}: RenderCardsProps) {
  return (
    <View style={styles.grid}>
      {data.map((item, index) => (
        <TouchableOpacity
          key={`${item.label}-${index}`}
          disabled={!item.player && !onPress}
          onPress={() => {
            if (item.player) {
              onSelectPlayer?.(item.player);
            } else {
              onPress?.(item.label);
            }
          }}
          style={[styles.card, item.fullWidth && styles.fullWidthCard]}
        >
          <View>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value || 'N/A'}</Text>
          </View>

          {(item.onEdit || item.onRemove) && (
            <View style={styles.actionsRow}>
              {item.onEdit && (
                <TouchableOpacity onPress={item.onEdit}>
                  <Text style={styles.action}>Edit</Text>
                </TouchableOpacity>
              )}
              {item.onRemove && (
                <TouchableOpacity onPress={item.onRemove}>
                  <Text style={styles.actionDelete}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 16,
  },
  card: {
    width: '47%',
    minHeight: 100,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fullWidthCard: {
    width: '100%',
  },
  cardLabel: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  action: {
    color: GlobalColors.bomber,
    fontSize: 13,
    fontWeight: '600',
  },
  actionDelete: {
    color: '#ff8080',
    fontSize: 13,
    fontWeight: '600',
  },
});
