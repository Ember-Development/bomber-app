import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TouchableOpacity,
} from 'react-native';
import CustomButton from '@/components/ui/atoms/Button';
import { useDeleteTrophy } from '@/hooks/teams/useTeams';

interface Props {
  visible: boolean;
  trophyId: string;
  teamId: string;
  trophyTitle: string;
  onClose: () => void;
}

const RemoveTrophyModal: React.FC<Props> = ({
  visible,
  trophyId,
  teamId,
  trophyTitle,
  onClose,
}) => {
  const { mutate, isPending } = useDeleteTrophy(onClose);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Remove Trophy</Text>
            <Text style={styles.subtitle}>
              Are you sure you want to remove{' '}
              <Text style={styles.highlight}>{trophyTitle}</Text>?
            </Text>

            <View style={styles.actions}>
              <CustomButton
                title="Confirm"
                onPress={() => mutate({ teamId, trophyId })}
              />
              <CustomButton title="Cancel" onPress={onClose} variant="danger" />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modal: {
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 20,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  highlight: {
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    gap: 0,
  },
});

export default RemoveTrophyModal;
