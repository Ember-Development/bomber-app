import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export interface BannerData {
  id: string;
  imageUrl: string;
  duration: number;
  expiresAt: Date;
}

interface BannerModalProps {
  visible: boolean;
  data: BannerData;
  onClose: () => void;
}

export default function BannerModal({
  visible,
  data,
  onClose,
}: BannerModalProps) {
  // animated value from 0 → 1
  const anim = useRef(new Animated.Value(0)).current;

  // trigger animation when `visible` becomes true
  useEffect(() => {
    if (visible) {
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [visible, anim]);

  // scale: 0.8 → 1
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  // opacity: 0 → 1
  const opacity = anim;

  const source = data.imageUrl.startsWith('http')
    ? { uri: data.imageUrl }
    : require('@/assets/images/bomberimage1.jpg');

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.container, { transform: [{ scale }], opacity }]}
        >
          <Image source={source} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const MODAL_WIDTH = width * 0.85;
const MODAL_HEIGHT = height * 0.7;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 4,
  },
});
