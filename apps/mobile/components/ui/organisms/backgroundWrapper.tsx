import React, { ReactNode } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  /** adds a subtle bottom fade so content/tabbar blends nicely */
  withBottomFade?: boolean;
};

export default function BackgroundWrapper({
  children,
  withBottomFade = true,
}: Props) {
  const insets = useSafeAreaInsets();

  // Android: avoid pure black at the end; use deep navy to reduce banding
  // Also use 3 stops + diagonal to smooth it out.
  const gradientProps =
    Platform.OS === 'android'
      ? {
          colors: ['#0A3C6E', '#083154', '#041E3A'], // no #000
          locations: [0, 0.55, 1],
          start: { x: 0.25, y: 0 },
          end: { x: 0.85, y: 1 },
        }
      : {
          colors: ['#004987', '#000000'],
          start: { x: 0.5, y: 0 },
          end: { x: 0.5, y: 1 },
        };

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 0) }]}>
      {/* Background (under everything) */}
      <View style={styles.bg} pointerEvents="none">
        <LinearGradient {...gradientProps} style={StyleSheet.absoluteFill} />
        {Platform.OS === 'ios' ? (
          <BlurView intensity={50} style={StyleSheet.absoluteFill} />
        ) : null}
      </View>

      {/* Optional bottom soft fade so the tab bar / content edge looks clean */}
      {withBottomFade && (
        <LinearGradient
          pointerEvents="none"
          colors={
            Platform.OS === 'android'
              ? ['transparent', 'rgba(4,30,58,0.75)', 'rgba(4,30,58,1)']
              : ['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']
          }
          locations={[0, 0.7, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.bottomFade,
            { height: 80 + Math.max(insets.bottom, 0) },
          ]}
        />
      )}

      {/* Foreground */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Fallback color that matches Android end color to avoid a harsh edge
    backgroundColor: '#041E3A',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // still under content
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
