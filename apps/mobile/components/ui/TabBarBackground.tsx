import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabBarBackground() {
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 70;

  return (
    <BlurView
      tint="dark"
      intensity={100}
      style={[
        styles.blur,
        {
          height: TAB_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* 1) Navy overlay */}
      <View style={styles.navyOverlay} />

      {/* 2) Top highlight border */}
      <View style={styles.topBorder} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  navyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1, 1, 26, 0.9)',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
