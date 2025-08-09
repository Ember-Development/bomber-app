import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditCoachContent from './edit-coach-form';
import { CoachFE } from '@bomber-app/database';
import { useUpdateCoach } from '@/hooks/teams/useCoach';

interface Props {
  visible: boolean;
  coach: CoachFE;
  onClose: () => void;
}

const EditCoachModal: React.FC<Props> = ({ visible, coach, onClose }) => {
  const { mutate, isPending } = useUpdateCoach(onClose);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose} // Android hardware back button
    >
      <View style={styles.modal}>
        {/* Close Button */}
        <View style={styles.header}>
          <Text style={styles.title}>Edit Coach</Text>
          <Text style={styles.close} onPress={onClose}>
            Close
          </Text>
        </View>

        <EditCoachContent
          coach={coach}
          loading={isPending}
          onSubmit={(data: any) => mutate({ id: coach.id, data })}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.98)',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  close: {
    color: '#ff9999',
    fontSize: 16,
  },
});

export default EditCoachModal;
