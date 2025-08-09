import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
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
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <View style={styles.modal}>
              <View style={styles.header}>
                <Text style={styles.title}>Remove Player</Text>
                <Text style={styles.close} onPress={onClose}>
                  Close
                </Text>
              </View>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  close: {
    fontSize: 16,
    color: '#ff9999',
    fontWeight: '600',
  },
  message: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmButton: {
    backgroundColor: '#ff6666',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
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
