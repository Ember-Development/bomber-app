import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Linking,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export interface BannerData {
  id: string;
  imageUrl: string;
  link?: string;
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

  const handleBannerPress = async () => {
    if (data.link) {
      try {
        const canOpen = await Linking.canOpenURL(data.link);
        if (canOpen) {
          await Linking.openURL(data.link);
          onClose(); // Close banner after opening link
        }
      } catch (error) {
        console.error('Error opening banner link:', error);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.container, { transform: [{ scale }], opacity }]}
        >
          <TouchableOpacity
            onPress={handleBannerPress}
            activeOpacity={data.link ? 0.8 : 1}
            disabled={!data.link}
            style={{ width: '100%', height: '100%' }}
          >
            <Image source={source} style={styles.image} resizeMode="cover" />
            {data.link && (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.ctaGradient}
              >
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>Tap to See More</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>
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
  ctaGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
