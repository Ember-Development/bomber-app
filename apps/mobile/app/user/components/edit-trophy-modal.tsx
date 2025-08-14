import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { useUpdateTrophy } from '@/hooks/teams/useTeams';

interface Props {
  visible: boolean;
  trophy: { id: string; title: string; imageURL: string };
  teamId: string;
  onClose: () => void;
}

const EditTrophyModal: React.FC<Props> = ({
  visible,
  trophy,
  teamId,
  onClose,
}) => {
  const [title, setTitle] = useState(trophy.title);
  const [imageURL, setImageURL] = useState(trophy.imageURL);

  const { mutate, isPending } = useUpdateTrophy(onClose);

  const handleUpdate = () => {
    mutate({ teamId, trophyId: trophy.id, data: { title, imageURL } });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.fullscreenOverlay}>
          <ScrollView
            contentContainerStyle={styles.modal}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Edit Trophy</Text>

            <CustomInput
              label="Trophy Title"
              value={title}
              onChangeText={setTitle}
            />
            <CustomInput
              label="Image URL"
              value={imageURL}
              onChangeText={setImageURL}
            />

            <View style={styles.actions}>
              <CustomButton
                title={isPending ? 'Saving...' : 'Save'}
                onPress={handleUpdate}
              />
              <CustomButton title="Cancel" onPress={onClose} variant="danger" />
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modal: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(20,20,20,0.95)',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    marginTop: 30,
    gap: 12,
  },
});

export default EditTrophyModal;
