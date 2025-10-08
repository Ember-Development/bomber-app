import React from 'react';
import { View } from 'react-native';
import VideosScreen from '../side/videos';

export default function Media() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <VideosScreen />
      </View>
    </View>
  );
}
