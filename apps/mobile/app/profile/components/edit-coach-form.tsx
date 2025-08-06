import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { CoachFE } from '@bomber-app/database';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomSelect from '@/components/ui/atoms/dropdown';
import { US_STATES } from '@/utils/state';
import { GlobalColors } from '@/constants/Colors';

interface Props {
  coach: CoachFE;
  loading: boolean;
  onSubmit: (data: any) => void;
}

const EditCoachContent: React.FC<Props> = ({ coach, loading, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'contact'>('info');

  const user = coach.user;
  if (!user)
    return <Text style={{ color: '#fff' }}>Missing coach user data</Text>;

  const [formData, setFormData] = useState({
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    phone: user.phone || '',
    address1: coach.address?.address1 || '',
    address2: coach.address?.address2 || '',
    city: coach.address?.city || '',
    zip: coach.address?.zip || '',
    state: coach.address?.state || '',
  });

  const handleSubmit = () => {
    onSubmit({
      fname: formData.fname,
      lname: formData.lname,
      email: formData.email,
      phone: formData.phone,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.section}>
            <CustomInput
              label="First Name"
              value={formData.fname}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, fname: text })}
            />
            <CustomInput
              label="Last Name"
              value={formData.lname}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, lname: text })}
            />
          </View>
        );
      case 'contact':
        return (
          <View style={styles.section}>
            <CustomInput
              label="Email"
              value={formData.email}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <CustomInput
              label="Phone"
              value={formData.phone}
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <CustomInput
              label="Address 1"
              value={formData.address1}
              fullWidth
              onChangeText={(text) =>
                setFormData({ ...formData, address1: text })
              }
            />
            <CustomInput
              label="Address 2"
              value={formData.address2}
              fullWidth
              onChangeText={(text) =>
                setFormData({ ...formData, address2: text })
              }
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomInput
                  label="City"
                  value={formData.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                />
              </View>
              <View style={styles.half}>
                <CustomInput
                  label="Zipcode"
                  value={formData.zip}
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
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabs}>
        {['info', 'contact'].map((key) => (
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
            style={[styles.updateButton, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={handleSubmit}
          >
            <Text style={styles.updateText}>
              {loading ? 'Updating...' : 'Update Coach'}
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

export default EditCoachContent;
