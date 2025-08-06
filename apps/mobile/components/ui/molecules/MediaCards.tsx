import React, { useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoCardProps {
  image: ImageSourcePropType;
  title: string;
  onPress: () => void;
}

export default function VideoCard({ image, title, onPress }: VideoCardProps) {
  const onScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(onScale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(onScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: onScale }] }]}>
        <View style={styles.imageWrapper}>
          <ImageBackground
            source={image}
            style={styles.image}
            imageStyle={{ borderRadius: 20 }}
          >
            <View style={styles.content}>
              <Ionicons
                name="play-circle-sharp"
                size={40}
                color="#5194E5"
                style={styles.playIcon}
              />
            </View>
            <View style={styles.bottomFade}>
              <Text style={styles.title}>{title}</Text>
            </View>
          </ImageBackground>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 210,
    marginRight: 12,
    borderRadius: 20,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomFade: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  playIcon: {
    alignSelf: 'center',
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
