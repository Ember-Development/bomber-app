import React, { ReactNode } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  withBottomFade?: boolean;
};

export default function BackgroundWrapper({
  children,
  withBottomFade = true,
}: Props) {
  const insets = useSafeAreaInsets();

  const gradientProps: LinearGradientProps =
    Platform.OS === 'android'
      ? {
          colors: ['#0A3C6E', '#083154', '#041E3A'] as const,
          locations: [0, 0.55, 1] as const, // tuple ✅
          start: { x: 0.25, y: 0 },
          end: { x: 0.85, y: 1 },
        }
      : {
          colors: ['#004987', '#000000'] as const,
          start: { x: 0.5, y: 0 },
          end: { x: 0.5, y: 1 },
        };

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 0) }]}>
      <View style={styles.bg} pointerEvents="none">
        <LinearGradient {...gradientProps} style={StyleSheet.absoluteFill} />
        {Platform.OS === 'ios' ? (
          <BlurView intensity={50} style={StyleSheet.absoluteFill} />
        ) : null}
      </View>

      {withBottomFade && (
        <LinearGradient
          pointerEvents="none"
          colors={
            Platform.OS === 'android'
              ? ([
                  'transparent',
                  'rgba(4,30,58,0.75)',
                  'rgba(4,30,58,1)',
                ] as const)
              : (['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)'] as const)
          }
          locations={[0, 0.7, 1] as const} // tuple ✅
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.bottomFade,
            { height: 80 + Math.max(insets.bottom, 0) },
          ]}
        />
      )}

      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#041E3A' },
  bg: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  bottomFade: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 0 },
  content: { flex: 1, zIndex: 1 },
});
