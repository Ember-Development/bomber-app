import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import EditPlayerContent from '../components/edit-player-form';
import { PlayerFE } from '@bomber-app/database';

interface Props {
  visible: boolean;
  player: PlayerFE;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditPlayerModal: React.FC<Props> = ({
  visible,
  player,
  onClose,
  onSuccess,
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Player</Text>
          <Text style={styles.close} onPress={onClose}>
            Close
          </Text>
        </View>
        <EditPlayerContent player={player} onSuccess={onSuccess} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#000',
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

export default EditPlayerModal;
