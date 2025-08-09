import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import {
  JerseySize,
  PantsSize,
  Position,
  ShortsSize,
  StirrupSize,
  PlayerFE,
} from '@bomber-app/database';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { US_STATES } from '@/utils/state';
import {
  POSITIONS,
  JERSEY_SIZES,
  PANT_SIZES,
  STIRRUP_SIZES,
  SHORTS_SIZES,
} from '@/utils/enumOptions';
import { GlobalColors } from '@/constants/Colors';
import { useUpdatePlayer } from '@/hooks/teams/usePlayerById';

interface Props {
  player: PlayerFE;
  onSuccess?: () => void;
}

const EditPlayerContent: React.FC<Props> = ({ player, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'gear'>(
    'info'
  );
  const [isPending, setIsPending] = useState(false);

  const user = player.user;
  if (!user)
    return <Text style={{ color: '#fff' }}>Missing player user data</Text>;

  const { mutate: updatePlayer } = useUpdatePlayer(player.id, {
    onSuccess: () => onSuccess?.(),
  });

  const [formData, setFormData] = useState({
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    phone: user.phone || '',
    pos1: player.pos1,
    pos2: player.pos2,
    jerseyNum: player.jerseyNum,
    gradYear: player.gradYear,
    college: player.college || '',
    address1: player.address?.address1 || '',
    address2: player.address?.address2 || '',
    city: player.address?.city || '',
    zip: player.address?.zip || '',
    state: player.address?.state || '',
    jerseySize: player.jerseySize,
    pantSize: player.pantSize,
    stirrupSize: player.stirrupSize,
    shortSize: player.shortSize,
    practiceShortSize: player.practiceShortSize,
  });

  const handleSubmit = () => {
    setIsPending(true);
    updatePlayer(formData, {
      onSettled: () => setIsPending(false),
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.section}>
            <CustomInput
              label="First Name"
              defaultValue={formData.fname}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, fname: text })}
            />
            <CustomInput
              label="Last Name"
              defaultValue={formData.lname}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, lname: text })}
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomSelect
                  label="Position 1"
                  options={POSITIONS}
                  defaultValue={formData.pos1}
                  onSelect={(value) =>
                    setFormData({ ...formData, pos1: value as Position })
                  }
                />
              </View>
              <View style={styles.half}>
                <CustomSelect
                  label="Position 2"
                  options={POSITIONS}
                  defaultValue={formData.pos2}
                  onSelect={(value) =>
                    setFormData({ ...formData, pos2: value as Position })
                  }
                />
              </View>
            </View>
            <CustomInput
              label="Jersey #"
              defaultValue={formData.jerseyNum}
              fullWidth
              onChangeText={(text) =>
                setFormData({ ...formData, jerseyNum: text })
              }
            />
            <CustomInput
              label="Graduation Year"
              defaultValue={formData.gradYear}
              fullWidth
              onChangeText={(text) =>
                setFormData({ ...formData, gradYear: text })
              }
            />
            <CustomInput
              label="College Committed"
              defaultValue={formData.college}
              fullWidth
              onChangeText={(text) =>
                setFormData({ ...formData, college: text })
              }
            />
          </View>
        );
      case 'contact':
        return (
          <View style={styles.section}>
            <CustomInput
              label="Email"
              defaultValue={formData.email}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <CustomInput
              label="Phone"
              defaultValue={formData.phone}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <CustomInput
              label="Address 1"
              defaultValue={formData.address1}
              fullWidth
              onChangeText={(text) =>
                setFormData({ ...formData, address1: text })
              }
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomInput
                  label="City"
                  defaultValue={formData.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                />
              </View>
              <View style={styles.half}>
                <CustomInput
                  label="Zipcode"
                  defaultValue={formData.zip}
                  onChangeText={(text) =>
                    setFormData({ ...formData, zip: text })
                  }
                />
              </View>
            </View>
            <CustomSelect
              label="State"
              options={US_STATES}
              defaultValue={formData.state}
              onSelect={(value) => setFormData({ ...formData, state: value })}
            />
          </View>
        );
      case 'gear':
        return (
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomSelect
                  label="Jersey Size"
                  options={JERSEY_SIZES}
                  defaultValue={formData.jerseySize}
                  onSelect={(value) =>
                    setFormData({
                      ...formData,
                      jerseySize: value as JerseySize,
                    })
                  }
                />
              </View>
              <View style={styles.half}>
                <CustomSelect
                  label="Pant Size"
                  options={PANT_SIZES}
                  defaultValue={formData.pantSize}
                  onSelect={(value) =>
                    setFormData({ ...formData, pantSize: value as PantsSize })
                  }
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomSelect
                  label="Stirrup Size"
                  options={STIRRUP_SIZES}
                  defaultValue={formData.stirrupSize}
                  onSelect={(value) =>
                    setFormData({
                      ...formData,
                      stirrupSize: value as StirrupSize,
                    })
                  }
                />
              </View>
              <View style={styles.half}>
                <CustomSelect
                  label="Short Size"
                  options={SHORTS_SIZES}
                  defaultValue={formData.shortSize}
                  onSelect={(value) =>
                    setFormData({ ...formData, shortSize: value as ShortsSize })
                  }
                />
              </View>
            </View>
            <CustomSelect
              label="Practice Short Size"
              options={SHORTS_SIZES}
              defaultValue={formData.practiceShortSize}
              onSelect={(value) =>
                setFormData({
                  ...formData,
                  practiceShortSize: value as ShortsSize,
                })
              }
            />
          </View>
        );
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabs}>
        {['info', 'contact', 'gear'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabButton, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key as typeof activeTab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === key && styles.tabTextActive,
              ]}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.formGlass}>{renderTab()}</View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.updateButton, isPending && { opacity: 0.6 }]}
            disabled={isPending}
            onPress={handleSubmit}
          >
            <Text style={styles.updateText}>
              {isPending ? 'Updating...' : 'Update Player'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabText: {
    color: '#eee',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  formGlass: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  half: {
    flex: 1,
  },
  actions: {
    marginTop: 30,
    gap: 14,
    paddingHorizontal: 16,
  },
  updateButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateText: {
    color: GlobalColors.bomber,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditPlayerContent;
