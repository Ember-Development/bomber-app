import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { formatGearLabel, formatLabel } from '@/utils/formatDisplay';

interface ProfileTabsProps {
  user: any;
}

interface GlassCardProps {
  label: string;
  value: string;
  isFullWidth?: boolean;
}

function GlassCard({ label, value, isFullWidth = false }: GlassCardProps) {
  return (
    <View style={[styles.card, isFullWidth && styles.fullWidthCard]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'gear'>(
    'info'
  );

  const renderCards = (
    data: {
      label: string;
      value: string | null | undefined;
      fullWidth?: boolean;
    }[]
  ) => {
    const processed = data.map((item, i) => ({
      ...item,
      value: formatLabel(item.value) || 'N/A',
    }));

    return (
      <View style={styles.grid}>
        {processed.map((item, index) => (
          <GlassCard
            key={item.label}
            label={item.label}
            value={item.value}
            isFullWidth={item.fullWidth}
          />
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return renderCards([
          { label: 'Team', value: user.player?.team?.name, fullWidth: true },
          { label: 'Grad Year', value: user.player?.gradYear },
          { label: 'Age Group', value: user.player?.ageGroup },
          { label: 'Pos 1', value: user.player?.pos1 },
          { label: 'Pos 2', value: user.player?.pos2 },
          {
            label: 'College Commitment',
            value: user.player?.college,
            fullWidth: true,
          },
        ]);
      case 'contact':
        return renderCards([
          { label: 'Email', value: user.email, fullWidth: true },
          { label: 'Phone', value: user.phone },
          { label: 'Date of Birth', value: user.player?.dob },
          {
            label: 'Street Address',
            value: user.player?.address
              ? `${user.player.address.address1} ${user.player.address.address2 ?? ''}`.trim()
              : undefined,
            fullWidth: true,
          },
          {
            label: 'State',
            value: user.player?.address?.state,
            fullWidth: true,
          },
          { label: 'City', value: user.player?.address?.city },
          { label: 'Zipcode', value: user.player?.address?.zip },
        ]);
      case 'gear':
        const gearItems = [
          {
            label: 'Jersey Size',
            value: formatGearLabel(user.player?.jerseySize),
          },
          {
            label: 'Pant Size',
            value: formatGearLabel(user.player?.pantSize),
          },
          {
            label: 'Stirrup Size',
            value: formatGearLabel(user.player?.stirrupSize),
          },
          {
            label: 'Short Size',
            value: formatGearLabel(user.player?.shortSize),
          },
          {
            label: 'Practice Short Size',
            value: formatGearLabel(user.player?.practiceShortSize),
          },
        ];

        const odd = gearItems.length % 2 !== 0;
        if (odd) gearItems[gearItems.length - 1].fullWidth = true;
        return renderCards(gearItems);
      default:
        return null;
    }
  };

  return (
    <View>
      <View style={styles.floatingTabsContainer}>
        <TabButton
          label="Info"
          active={activeTab === 'info'}
          onPress={() => setActiveTab('info')}
        />
        <TabButton
          label="Contact"
          active={activeTab === 'contact'}
          onPress={() => setActiveTab('contact')}
        />
        <TabButton
          label="Gear"
          active={activeTab === 'gear'}
          onPress={() => setActiveTab('gear')}
        />
      </View>
      {renderContent()}
    </View>
  );
}

const TabButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabButton, active && styles.tabButtonActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  floatingTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    padding: 6,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
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
});
