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

interface Props {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const BottomSheetModal: React.FC<Props> = ({
  isVisible,
  onClose,
  title = 'Modal Title',
  children,
}) => {
  console.log('BottomSheetModal children:', children);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.3}
      useNativeDriver
      style={styles.bottomSheetStyle}
    >
      <SafeAreaView style={styles.sheetContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheetStyle: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
});

export default BottomSheetModal;
