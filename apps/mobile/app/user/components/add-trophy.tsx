// features/modals/add-trophy.tsx
import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import FullScreenModal from '@/components/ui/organisms/FullSheetModal';
import CustomInput from '@/components/ui/atoms/Inputs';
import CustomButton from '@/components/ui/atoms/Button';
import { useAddTrophy } from '@/hooks/teams/useTeams';

type Props = {
  isVisible: boolean;
  teamId: string;
  onClose: () => void;
};

export default function AddTrophyModal({ isVisible, teamId, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [imageURL, setImageURL] = useState('');
  const { mutateAsync, isPending } = useAddTrophy(teamId, () => {
    // reset & close after successful mutation (useTeams hook already invalidates)
    setTitle('');
    setImageURL('');
    onClose();
  });

  useEffect(() => {
    if (!isVisible) {
      setTitle('');
      setImageURL('');
    }
  }, [isVisible]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a trophy title.');
      return;
    }
    try {
      await mutateAsync({ title: title.trim(), imageURL: imageURL.trim() });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to add trophy.');
    }
  };

  return (
    <FullScreenModal isVisible={isVisible} onClose={onClose} title="Add Trophy">
      <View style={{ padding: 16, gap: 12 }}>
        <CustomInput
          label="Title"
          fullWidth
          value={title}
          onChangeText={setTitle}
        />
        <CustomInput
          label="Image URL"
          fullWidth
          value={imageURL}
          onChangeText={setImageURL}
        />
        <CustomButton
          title={isPending ? 'Saving…' : 'Save'}
          onPress={handleSave}
          disabled={isPending || !title.trim()}
          fullWidth
        />
      </View>
    </FullScreenModal>
  );
}
