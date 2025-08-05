import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  Text,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const GLASS_COLORS = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.3)',
  text: '#fff',
  placeholder: 'rgba(255, 255, 255, 0.5)',
  icon: '#fff',
};

interface DateOfBirthInputProps {
  onChangeText?: (date: string) => void;
  fullWidth?: boolean;
  value?: string;
}

export default function DateOfBirthInput({
  onChangeText,
  fullWidth = false,
}: DateOfBirthInputProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });

  // Android handler: only commit and close once
  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'set' && selected) {
      setDate(selected);
      onChangeText?.(formatDate(selected));
    }
    setShowPicker(false);
  };

  // iOS: update tempDate on spin but don’t close
  const onIOSChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) {
      setTempDate(selected);
    }
  };

  const openPicker = () => {
    setTempDate(date || new Date());
    setShowPicker(true);
  };

  const closeIOS = () => {
    setDate(tempDate);
    onChangeText?.(formatDate(tempDate));
    setShowPicker(false);
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      <Text style={[styles.label, { color: GLASS_COLORS.text }]}>
        Date of Birth
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.inputWrapper,
          {
            backgroundColor: GLASS_COLORS.background,
            borderColor: GLASS_COLORS.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={openPicker}
      >
        <TextInput
          style={[styles.input, { color: GLASS_COLORS.text }]}
          placeholder="MM/DD/YYYY"
          placeholderTextColor={GLASS_COLORS.placeholder}
          value={date ? formatDate(date) : ''}
          editable={false}
          pointerEvents="none"
        />
        <Ionicons
          name="calendar-outline"
          size={20}
          style={[styles.icon, { color: GLASS_COLORS.icon }]}
        />
      </Pressable>

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          onChange={onAndroidChange}
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={onIOSChange}
                textColor="#fff"
              />
              <Pressable style={styles.closeBtn} onPress={closeIOS}>
                <Text style={{ color: GLASS_COLORS.text }}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 5,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: GLASS_COLORS.background,
    borderRadius: 14,
    padding: 16,
    width: '100%',
  },
  closeBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
});
