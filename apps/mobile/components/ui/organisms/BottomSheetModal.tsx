import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

interface ReusableModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'bottom-sheet' | 'full-screen';
}

const ReusableModal: React.FC<ReusableModalProps> = ({
  isVisible,
  onClose,
  title = 'Modal Title',
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'full-screen',
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
      style={
        variant === 'bottom-sheet'
          ? styles.bottomSheetStyle
          : styles.fullScreenStyle
      }
    >
      <SafeAreaView
        style={[
          styles.modalContainer,
          variant === 'bottom-sheet' && styles.bottomSheetContainer,
        ]}
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Content Wrapper - Ensures dynamic height */}
        <View
          style={
            variant === 'full-screen'
              ? styles.contentWrapperFull
              : styles.contentWrapperSheet
          }
        >
          <View style={styles.content}>{children}</View>
        </View>

        {/* Buttons - Always at the Bottom */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          {onConfirm && (
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  contentWrapperFull: {
    width: '100%',
  },
  contentWrapperSheet: {
    flexGrow: 1,
    width: '100%',
  },
  content: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomSheetStyle: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomSheetContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 0,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  fullScreenStyle: {
    margin: 0,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    padding: 10,
  },
});

export default ReusableModal;
