import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  JerseySize,
  PantsSize,
  Position,
  ShortsSize,
  StirrupSize,
  UserFE,
} from '@bomber-app/database';
import CustomInput from '@/components/ui/atoms/Inputs';
import {
  POSITIONS,
  JERSEY_SIZES,
  PANT_SIZES,
  STIRRUP_SIZES,
  SHORTS_SIZES,
} from '@/utils/enumOptions';
import { US_STATES } from '@/utils/state';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { useUpdateUser } from '@/hooks/useUser';
import { useUserContext } from '@/context/useUserContext';

interface Props {
  user: UserFE;
  onSuccess?: () => void;
}

const EditProfileContent: React.FC<Props> = ({ user, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'gear'>(
    'info'
  );
  const { refetch } = useUserContext();
  const [isPending, setIsPending] = useState(false);

  const { mutate: updateUser } = useUpdateUser(user.id, {
    onSuccess: () => console.log('Update successful'),
  });

  const [formData, setFormData] = useState({
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    phone: user.phone || '',
    pos1: user.player?.pos1,
    pos2: user.player?.pos2,
    jerseyNum: user.player?.jerseyNum,
    gradYear: user.player?.gradYear,
    college: user.player?.college,
    address1: user.player?.address?.address1,
    address2: user.player?.address?.address2,
    city: user.player?.address?.city,
    zip: user.player?.address?.zip,
    state: user.player?.address?.state,
    jerseySize: user.player?.jerseySize,
    pantSize: user.player?.pantSize,
    stirrupSize: user.player?.stirrupSize,
    shortSize: user.player?.shortSize,
    practiceShortSize: user.player?.practiceShortSize,
  });

  const handleSubmit = () => {
    setIsPending(true);
    updateUser(formData, {
      onSuccess: () => {
        refetch();
        onSuccess?.();
      },
      onSettled: () => {
        setIsPending(false);
      },
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
              defaultValue={formData.college ?? undefined}
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
            <CustomInput
              label="Address 2"
              defaultValue={formData.address2}
              fullWidth
              onChangeText={(text) =>
                setFormData({ ...formData, address2: text })
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
    <View style={{ flex: 1 }}>
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
        {renderTab()}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.updateButton, isPending && { opacity: 0.6 }]}
            disabled={isPending}
            onPress={handleSubmit}
          >
            <Text style={styles.updateText}>
              {isPending ? 'Updating...' : 'Update Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
    marginVertical: 10,
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
  tabActive: {
    backgroundColor: '#000',
  },
  tabText: {
    color: '#555',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  half: {
    flex: 1,
  },
  actions: {
    marginTop: 30,
    paddingHorizontal: 16,
    gap: 14,
  },
  updateButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  removeText: {
    color: 'red',
    fontWeight: '600',
  },
});

export default EditProfileContent;
