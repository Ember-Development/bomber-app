import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

interface NotificationToastProps {
  visible: boolean;
  title: string;
  body: string;
  imageUrl?: string | null;
  deepLink?: string | null;
  onDismiss: () => void;
  onPress: (deepLink?: string | null) => void;
}

export default function NotificationToast({
  visible,
  title,
  body,
  imageUrl,
  deepLink,
  onDismiss,
  onPress,
}: NotificationToastProps) {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'component');

  // Show animation
  useEffect(() => {
    if (visible) {
      // Reset animation values
      translateY.setValue(-200);
      opacity.setValue(0);
      scale.setValue(0.9);

      // Animate in with spring effect
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      timerRef.current = setTimeout(() => {
        hideToast();
      }, 4000);
    } else {
      hideToast();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handlePress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onPress(deepLink);
    hideToast();
  };

  if (!visible) return null;

  const extractEventId = (link: string): string | null => {
    const eventMatch = link.match(/(?:event|events)\/([a-zA-Z0-9-]+)/);
    return eventMatch ? eventMatch[1] : null;
  };

  const hasEventLink = deepLink ? extractEventId(deepLink) !== null : false;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          top: insets.top + 10,
          width: width - 32,
          left: 16,
        },
      ]}
    >
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.glassOverlay} />
        <Pressable
          onPress={handlePress}
          style={styles.pressable}
          android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: false }}
        >
          <View style={styles.content}>
            {/* Left: Image or Icon */}
            <View style={styles.leftSection}>
              {imageUrl ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.imageGlow} />
                </View>
              ) : (
                <View style={styles.iconWrapper}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: iconColor + '20' },
                    ]}
                  >
                    <Ionicons
                      name="notifications"
                      size={26}
                      color={iconColor}
                    />
                  </View>
                  <View
                    style={[styles.iconGlow, { backgroundColor: iconColor }]}
                  />
                </View>
              )}
            </View>

            {/* Middle: Text Content */}
            <View style={styles.textSection}>
              <ThemedText
                style={[styles.title, { color: '#FFFFFF' }]}
                numberOfLines={1}
              >
                {title}
              </ThemedText>
              <ThemedText
                style={[styles.body, { color: '#FFFFFF' }]}
                numberOfLines={2}
              >
                {body}
              </ThemedText>
            </View>

            {/* Right: Arrow or Close Icon */}
            <View style={styles.rightSection}>
              <View style={styles.actionIconWrapper}>
                {deepLink ? (
                  <Ionicons
                    name="arrow-forward-circle"
                    size={32}
                    color="#FFFFFF"
                    style={{ opacity: 0.9 }}
                  />
                ) : (
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color="#FFFFFF"
                    style={{ opacity: 0.6 }}
                  />
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  pressable: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  leftSection: {
    width: 56,
    height: 56,
  },
  imageWrapper: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconWrapper: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 14,
    opacity: 0.15,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  textSection: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.85,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
