import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayerFE } from '@bomber-app/database';
import { useNormalizedUser } from '@/utils/user';
import {
  formatAgeGroup,
  formatPantSize,
  formatPosition,
} from '@/utils/enumOptions';

const { width } = Dimensions.get('window');

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
  const { primaryRole } = useNormalizedUser();
  const canSeeContactAndGear = ['ADMIN', 'COACH', 'REGIONAL_COACH'].includes(
    primaryRole
  );

  const [currentPage, setCurrentPage] = useState(0);

  if (!player) return null;

  const infoCards = [
    { label: 'Primary Position', value: formatPosition(player.pos1) },
    { label: 'Secondary Position', value: formatPosition(player.pos2) },
    { label: 'Age Group', value: formatAgeGroup(player.ageGroup) },
    { label: 'Grad Year', value: player.gradYear },
    { label: 'College Commitment', value: player.college ?? 'Uncommitted' },
  ];

  const contactCards = [
    { label: 'Email', value: player.user?.email ?? 'N/A', fullWidth: true },
    { label: 'Phone', value: player.user?.phone ?? 'N/A' },
    { label: 'Date of Birth', value: player.dob ?? 'N/A' },
    {
      label: 'Street Address',
      value: player.address
        ? `${player.address.address1} ${player.address.address2 ?? ''}`.trim()
        : 'N/A',
      fullWidth: true,
    },
    { label: 'City', value: player.address?.city ?? 'N/A' },
    { label: 'State', value: player.address?.state ?? 'N/A' },
    { label: 'Zipcode', value: player.address?.zip ?? 'N/A' },
  ];

  const gearCards = [
    { label: 'Jersey Size', value: player.jerseySize },
    { label: 'Pant Size', value: formatPantSize(player.pantSize) },
    { label: 'Stirrup Size', value: player.stirrupSize },
    { label: 'Short Size', value: player.shortSize },
    { label: 'Practice Short Size', value: player.practiceShortSize },
  ];

  const renderCards = (
    cards: { label: string; value: string; fullWidth?: boolean }[]
  ) => (
    <View style={styles.grid}>
      {cards.map((card, i) => {
        const isLast = i === cards.length - 1;
        const isOdd = cards.length % 2 !== 0;
        const fullWidth = card.fullWidth ?? (isOdd && isLast);
        return (
          <GlassCard
            key={`${card.label}-${i}`}
            label={card.label}
            value={card.value}
            isFullWidth={fullWidth}
          />
        );
      })}
    </View>
  );

  const slides = [
    { key: 'info', cards: infoCards },
    ...(canSeeContactAndGear ? [{ key: 'contact', cards: contactCards }] : []),
    ...(canSeeContactAndGear ? [{ key: 'gear', cards: gearCards }] : []),
  ];

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

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

          {/* Horizontal swiper with paging */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            style={styles.swiper}
          >
            {slides.map((slide) => (
              <View key={slide.key} style={[styles.slideContainer, { width }]}>
                <ScrollView
                  nestedScrollEnabled
                  contentContainerStyle={styles.slideContent}
                >
                  {renderCards(slide.cards)}
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          {/* Page Indicator */}
          <View style={styles.indicatorContainer}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, currentPage === i && styles.dotActive]}
              />
            ))}
          </View>
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
    paddingTop: 100,
    alignItems: 'center',
    paddingHorizontal: 0,
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
    marginBottom: 16,
  },
  swiper: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    paddingTop: 8,
  },
  slideContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
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
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 34,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
});
