import ReadOnlyField from '@/components/ui/atoms/ReadOnlyField';
import { formatGearLabel, formatLabel } from '@/utils/formatDisplay';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface ProfileTabsProps {
  user: any; // Replace with UserFE type later
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'gear'>(
    'info'
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.container}>
            <View style={styles.fullRow}>
              <ReadOnlyField
                label="Team"
                value={formatLabel(user.player?.team?.name)}
                fullWidth
              />
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <ReadOnlyField
                  label="Grad Year"
                  value={formatLabel(user.player?.gradYear)}
                />
              </View>
              <View style={styles.half}>
                <ReadOnlyField
                  label="College Commitment"
                  value={formatLabel(user.player?.college)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.third}>
                <ReadOnlyField
                  label="Pos 1"
                  value={formatLabel(user.player?.pos1)}
                />
              </View>
              <View style={styles.third}>
                <ReadOnlyField
                  label="Pos 2"
                  value={formatLabel(user.player?.pos2)}
                />
              </View>
              <View style={styles.third}>
                <ReadOnlyField
                  label="Age Group"
                  value={formatLabel(user.player?.ageGroup)}
                />
              </View>
            </View>
          </View>
        );
      case 'contact':
        return (
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { paddingBottom: 80, flexGrow: 1 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.fullRow}>
              <ReadOnlyField
                label="Email"
                value={formatLabel(user.email)}
                fullWidth
              />
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                <ReadOnlyField label="Phone" value={user.phone || 'N/A'} />
              </View>
              <View style={styles.half}>
                <ReadOnlyField
                  label="Date of Birth"
                  value={user.player?.dob || 'N/A'}
                />
              </View>
            </View>

            <View style={styles.fullRow}>
              <ReadOnlyField
                label="Street Address"
                value={
                  user.player?.address
                    ? formatLabel(
                        `${user.player.address.address1} ${user.player.address.address2 ?? ''}`.trim()
                      )
                    : 'N/A'
                }
                fullWidth
              />
            </View>

            <View style={styles.fullRow}>
              <ReadOnlyField
                label="State"
                value={formatLabel(user.player?.address?.state)}
                fullWidth
              />
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <ReadOnlyField
                  label="City"
                  value={formatLabel(user.player?.address?.city)}
                />
              </View>
              <View style={styles.half}>
                <ReadOnlyField
                  label="Zipcode"
                  value={user.player?.address?.zip || 'N/A'}
                />
              </View>
            </View>
          </ScrollView>
        );
      case 'gear':
        return (
          <View style={styles.container}>
            <View style={styles.row}>
              <View style={styles.half}>
                <ReadOnlyField
                  label="Jersey Size"
                  value={formatGearLabel(user.player?.jerseySize)}
                />
              </View>
              <View style={styles.half}>
                <ReadOnlyField
                  label="Pant Size"
                  value={formatGearLabel(user.player?.pantSize)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <ReadOnlyField
                  label="Stirrup Size"
                  value={formatGearLabel(user.player?.stirrupSize)}
                />
              </View>
              <View style={styles.half}>
                <ReadOnlyField
                  label="Short Size"
                  value={formatGearLabel(user.player?.shortSize)}
                />
              </View>
            </View>

            <View style={styles.fullRow}>
              <ReadOnlyField
                label="Practice Short Size"
                value={formatGearLabel(user.player?.practiceShortSize)}
                fullWidth
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View>
      <View style={styles.tabButtons}>
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
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  tabButtonActive: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    padding: 20,
  },
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fullRow: {
    width: '100%',
    marginBottom: 12,
  },
  half: {
    width: '48%',
  },
  third: {
    width: '30%',
  },
});
