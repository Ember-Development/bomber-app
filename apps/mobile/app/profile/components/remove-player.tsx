import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlobalColors } from '@/constants/Colors';
import { useNormalizedUser } from '@/utils/user';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playerName: string;
}

const RemovePlayerModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  playerName,
}) => {
  const { primaryRole } = useNormalizedUser();

  const isParent = primaryRole === 'PARENT';
  const message = isParent
    ? `Are you sure you want to remove ${playerName} from your athlete list?`
    : `Are you sure you want to remove ${playerName} from the team?`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Remove Player</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ff6666',
    borderRadius: 8,
  },
  cancelText: {
    color: '#ccc',
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default RemovePlayerModal;
