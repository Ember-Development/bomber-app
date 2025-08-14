import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {
  JerseySize,
  PantsSize,
  PlayerFE,
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
import { GlobalColors } from '@/constants/Colors';
import { useNormalizedUser } from '@/utils/user';

import SchoolInput from '@/components/ui/atoms/SchoolInput';
import type { FlatSchool } from '@/utils/SchoolUtil';
import { api } from '@/api/api';
import Checkbox from '@/components/ui/atoms/Checkbox';
import { useUpdatePlayer } from '@/hooks/teams/usePlayerById';
import { buildCommitCreatePayload } from '@/hooks/user/usePatchCommit';

interface Props {
  user: UserFE;
  onSuccess?: () => void;
}

const EditProfileContent: React.FC<Props> = ({
  user: intitialUser,
  onSuccess,
}) => {
  const { user, primaryRole } = useNormalizedUser();
  const isCoach =
    primaryRole === 'COACH' ||
    primaryRole === 'PARENT' ||
    primaryRole === 'FAN';
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'gear'>(
    isCoach ? 'info' : 'info'
  );
  const { refetch } = useUserContext();
  const [isPending, setIsPending] = useState(false);

  const { mutateAsync: updateUser } = useUpdateUser(intitialUser.id, {
    onSuccess: () => console.log('Update successful'),
  });

  const playerId = intitialUser.player?.id as string | undefined;
  const existingCommitId =
    (intitialUser.player as PlayerFE)?.commitId ?? undefined;

  // 🔽 state for form + commit UI
  const [formData, setFormData] = useState({
    fname: intitialUser.fname,
    lname: intitialUser.lname,
    email: intitialUser.email,
    phone: intitialUser.phone || '',
    pos1: intitialUser.player?.pos1,
    pos2: intitialUser.player?.pos2,
    jerseyNum: intitialUser.player?.jerseyNum,
    gradYear: intitialUser.player?.gradYear,
    college: intitialUser.player?.college ?? '', // keep display string here
    address1:
      intitialUser.player?.address?.address1 ||
      intitialUser.coach?.address?.address1 ||
      intitialUser.parent?.address?.address1,
    address2:
      intitialUser.player?.address?.address2 ||
      intitialUser.coach?.address?.address2 ||
      intitialUser.parent?.address?.address2,
    city:
      intitialUser.player?.address?.city ||
      intitialUser.coach?.address?.city ||
      intitialUser.parent?.address?.city,
    zip:
      intitialUser.player?.address?.zip ||
      intitialUser.coach?.address?.zip ||
      intitialUser.parent?.address?.zip,
    state:
      intitialUser.player?.address?.state ||
      intitialUser.coach?.address?.state ||
      intitialUser.parent?.address?.state,
    jerseySize: intitialUser.player?.jerseySize,
    pantSize: intitialUser.player?.pantSize,
    stirrupSize: intitialUser.player?.stirrupSize,
    shortSize: intitialUser.player?.shortSize,
    practiceShortSize: intitialUser.player?.practiceShortSize,
  });

  const [committed, setCommitted] = useState<boolean>(!!existingCommitId);
  const [collegeSchool, setCollegeSchool] = useState<FlatSchool | undefined>(
    undefined
  );
  const [commitDate, setCommitDate] = useState<string>(''); // YYYY-MM-DD

  const { mutateAsync: updatePlayer } = useUpdatePlayer(playerId ?? '', {});

  const handleSubmit = async () => {
    try {
      setIsPending(true);

      // Always start with normal profile updates
      const updates: any = { ...formData };

      const isPlayer = !!playerId && !isCoach;
      const hadCommit = !!existingCommitId;

      if (isPlayer) {
        if (committed) {
          if (hadCommit) {
            const patch = buildCommitCreatePayload({
              collegeSchool,
              collegeDisplay: formData.college,
              commitDate,
              fallbackState: undefined,
              fallbackCity: undefined,
            });

            if (Object.keys(patch).length > 0) {
              await api.patch(`/api/commits/${existingCommitId}`, patch);
            }
          } else {
            const createPayload = buildCommitCreatePayload({
              collegeSchool,
              collegeDisplay: formData.college,
              fallbackState: formData.state,
              fallbackCity: formData.city,
              commitDate,
            });
            const { data: created } = await api.post(
              '/api/commits',
              createPayload
            );
            updates.commitId = created.id;
          }
        } else if (!committed && hadCommit) {
          updates.commitId = null;
        }
      }

      await updateUser(updates);

      refetch();
      await onSuccess?.();
    } catch (err: any) {
      Alert.alert('Update failed', err?.message ?? 'Something went wrong.');
    } finally {
      setIsPending(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.section}>
            <CustomInput
              label="First Name"
              defaultValue={formData.fname}
              autoCapitalize="words"
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, fname: text })}
            />
            <CustomInput
              label="Last Name"
              defaultValue={formData.lname}
              autoCapitalize="words"
              fullWidth
              onChangeText={(text) => setFormData({ ...formData, lname: text })}
            />

            {!isCoach && (
              <>
                <View style={styles.row}>
                  <View className="half" style={styles.half}>
                    <CustomSelect
                      label="Position 1"
                      options={POSITIONS}
                      defaultValue={formData.pos1}
                      onSelect={(value) =>
                        setFormData({ ...formData, pos1: value as Position })
                      }
                    />
                  </View>
                  <View className="half" style={styles.half}>
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

                {/* 🔽 College commit block */}
                <Checkbox
                  label="Is this athlete committed to a college?"
                  checked={committed}
                  onChange={setCommitted}
                />

                {committed && (
                  <>
                    <SchoolInput
                      label="College"
                      placeholder="Search for a college"
                      value={collegeSchool}
                      onChange={(school) => {
                        setCollegeSchool(school);
                        setFormData((prev) => ({
                          ...prev,
                          college: school?.name ?? prev.college ?? '',
                        }));
                      }}
                    />
                    <CustomInput
                      label="College (Display Name)"
                      fullWidth
                      value={formData.college}
                      onChangeText={(text) =>
                        setFormData({ ...formData, college: text })
                      }
                    />
                  </>
                )}
              </>
            )}
          </View>
        );
      case 'contact':
        return (
          <View style={styles.section}>
            <CustomInput
              label="Email"
              defaultValue={formData.email}
              fullWidth
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="email-address"
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
              autoCapitalize="words"
              onChangeText={(text) =>
                setFormData({ ...formData, address1: text })
              }
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomInput
                  label="City"
                  defaultValue={formData.city}
                  autoCapitalize="words"
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                />
              </View>
              <View style={styles.half}>
                <CustomInput
                  label="Zipcode"
                  defaultValue={formData.zip}
                  keyboardType="number-pad"
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
      {!isCoach && (
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
      )}
      {isCoach && (
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
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.formGlass}>{renderTab()}</View>
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
  wrapper: {
    flex: 1,
    paddingTop: 30,
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

export default EditProfileContent;
