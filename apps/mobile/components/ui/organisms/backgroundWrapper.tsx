import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function BackgroundWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        {/* main blue gradient */}
        <LinearGradient
          // light logo blue → darker logo blue
          colors={['#004987', '#000']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* add a little extra softness on top */}
        <BlurView intensity={50} style={StyleSheet.absoluteFill} />

        {/* your actual content */}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4B9C' },

  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },

  content: {
    flex: 1,
    zIndex: 1,
  },
});
