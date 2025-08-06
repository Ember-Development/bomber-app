import React, { ReactNode, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_RADIUS = 24;
const BORDER_WIDTH = 2;

interface GlassCardProps {
  children: ReactNode;
}

export default function GlassCard({ children }: GlassCardProps) {
  // shimmer for a soft glow around edges
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glow]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.6)'],
  });

  return (
    <Animated.View style={[styles.wrapper, { borderColor }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)']}
        style={styles.gradientBackground}
      >
        <BlurView intensity={70} tint="light" style={styles.card}>
          {children}
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: CARD_RADIUS,
    borderWidth: BORDER_WIDTH,
    overflow: 'hidden',
    marginBottom: 16,
    // soft drop shadow for pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  gradientBackground: {
    borderRadius: CARD_RADIUS,
  },
  card: {
    padding: 24,
    borderRadius: CARD_RADIUS,
  },
});
