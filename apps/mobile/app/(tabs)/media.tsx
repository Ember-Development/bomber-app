<<<<<<< HEAD
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
=======
import { Text, View } from 'react-native';
import React from 'react';
import VideosScreen from '../side/videos';

const media = () => {
  return (
    <View>
      <Text>
        <VideosScreen />
      </Text>
    </View>
  );
};

export default media;
>>>>>>> events-tab
