import React from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayerFE } from '@bomber-app/database';
import { formatAgeGroup, formatPosition } from '@/utils/enumOptions';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  player: PlayerFE | null;
}

export default function ProfileModal({
  isVisible,
  onClose,
  player,
}: ProfileModalProps) {
  if (!player) return null;

  console.log('hi', player);

  const infoCards = [
    { label: 'Primary Position', value: formatPosition(player.pos1) },
    { label: 'Secondary Position', value: formatPosition(player.pos2) },
    { label: 'Age Group', value: formatAgeGroup(player.ageGroup) },
    { label: 'Grad Year', value: player.gradYear },
    { label: 'College Commitment', value: player.college ?? 'Uncommitted' },
  ];

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Image
          source={require('@/assets/images/bomberback.jpg')}
          style={styles.background}
          blurRadius={40}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <Image
            source={
              player.commit?.imageUrl
                ? { uri: player.commit.imageUrl }
                : require('@/assets/images/bomber-icon-blue.png')
            }
            style={styles.playerImage}
            resizeMode="contain"
          />
          <View style={styles.jerseyCircle}>
            <Text style={styles.jerseyText}>#{player.jerseyNum}</Text>
          </View>

          <Text style={styles.name}>
            {player.user?.fname} {player.user?.lname}
          </Text>

          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {infoCards.map((card, i) => {
              const isLast = i === infoCards.length - 1;
              const isOdd = infoCards.length % 2 !== 0;
              const isFullWidth = isOdd && isLast;
              return (
                <GlassCard
                  key={`${card.label}-${i}`}
                  label={card.label}
                  value={card.value}
                  isFullWidth={isFullWidth}
                />
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function GlassCard({
  label,
  value,
  isFullWidth = false,
}: {
  label: string;
  value: string;
  isFullWidth?: boolean;
}) {
  return (
    <View style={[styles.card, isFullWidth && styles.fullWidthCard]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingTop: 140,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  playerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  jerseyCircle: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  jerseyText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 40,
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
});
