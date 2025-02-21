import React, { useState, useRef } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

interface DateOfBirthInputProps {
  onChangeText?: (date: string) => void;
}

export default function DateOfBirthInput({
  onChangeText,
}: DateOfBirthInputProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(0)).current;

  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "component");
  const textColor = useThemeColor({}, "text");
  const labelColor = useThemeColor({}, "secondaryText");
  const modalBackground = useThemeColor({}, "background");

  const formatDate = (selectedDate: Date) => {
    return selectedDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleConfirm = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      if (onChangeText) onChangeText(formatDate(selectedDate));
      handleFocus();
    }
    setShowPicker(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabel, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!date) {
      setIsFocused(false);
      Animated.timing(animatedLabel, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 4], // Moves label up
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12], // Shrinks label
    }),
    color: isFocused ? textColor : textColor,
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: backgroundColor, borderColor: borderColor },
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          Date of Birth
        </Animated.Text>

        <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
          <TextInput
            value={date ? formatDate(date) : ""}
            placeholder={isFocused ? "" : "MM/DD/YYYY"}
            placeholderTextColor="transparent"
            editable={false}
          />
        </Pressable>
      </View>

      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleConfirm}
        />
      )}

      {/* iOS modal for the picker */}
      {Platform.OS === "ios" && (
        <Modal transparent animationType="slide" visible={showPicker}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={handleConfirm}
              />
              <Pressable
                onPress={() => setShowPicker(false)}
                style={styles.modalButton}
              >
                <Ionicons name="close-circle" size={24} color="red" />
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    position: "relative",
    height: 50,
  },
  label: {
    position: "absolute",
    left: 10,
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#000",
    paddingTop: 10,
  },
  // Modal styles for iOS
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalButton: {
    alignSelf: "center",
    marginTop: 10,
  },
});
