// components/ui/organisms/DangerConfirmModal.tsx
import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { GlobalColors } from '@/constants/Colors';

type Props = {
  isVisible: boolean;
  title: string;
  subtitle: string;
  confirmHint: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DangerConfirmModal({
  isVisible,
  title,
  subtitle,
  confirmHint,
  onClose,
  onConfirm,
}: Props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const canConfirm = useMemo(
    () => value.trim() === confirmHint.trim(),
    [value, confirmHint]
  );

  const handleConfirm = async () => {
    if (!canConfirm || loading) return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
          <Text style={styles.hint}>Type: {confirmHint}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#888"
            placeholder="Type here"
          />
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.cancel}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.danger,
                (!canConfirm || loading) && { opacity: 0.6 },
              ]}
              disabled={!canConfirm || loading}
              onPress={handleConfirm}
            >
              <Text style={styles.dangerText}>
                {loading ? 'Deleting…' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#ccc', marginBottom: 12 },
  hint: { color: '#bbb', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: { color: '#fff', fontWeight: '600' },
  danger: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: GlobalColors.bomber,
  },
  dangerText: { color: '#111', fontWeight: '700' },
});
