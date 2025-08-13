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
import { GlobalColors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

const GLASS_COLORS = {
  background: 'rgba(20, 20, 20, 0.7)',
  border: 'rgba(255, 255, 255, 0.2)',
  text: '#fff',
  icon: '#fff',
};

interface Props {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

const FullScreenModal: React.FC<Props> = ({
  isVisible,
  onClose,
  title = 'Modal Title',
  children,
}) => {
  const bgColor = useThemeColor({}, 'background');

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
      style={styles.fullScreenStyle}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: bgColor }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={GLASS_COLORS.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenStyle: {
    margin: 0,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: GLASS_COLORS.background,
    paddingTop: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  header: {
    padding: 20,
    marginTop: 40,
    borderBottomWidth: 1,
    borderColor: GLASS_COLORS.border,
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
    flex: 1,
    paddingHorizontal: 15,
  },
});

export default FullScreenModal;
