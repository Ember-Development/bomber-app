import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GlobalColors } from '@/constants/Colors';

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
  const bgColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'component');
  const borderColor = useThemeColor({}, 'border');
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
      <SafeAreaView
        style={[
          styles.sheetContainer,
          { backgroundColor: bgColor, borderColor },
        ]}
      >
        <View style={styles.dragHandle} />
        <View style={styles.header}>
          <Text style={[styles.title]}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={iconColor} />
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
    ...Platform.select({
      web: { backdropFilter: 'blur(16px)' },
      default: { backgroundColor: 'rgba(30,30,30,0.9)' },
    }),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 10,
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
    color: GlobalColors.bomber,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
});

export default BottomSheetModal;
