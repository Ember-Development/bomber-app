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

interface ArticleCardProps {
  image: ImageSourcePropType;
  title: string;
  onPress: () => void;
}

const READ_LABEL = 'READ ARTICLE';

export default function ArticleCard({
  image,
  title,
  onPress,
}: ArticleCardProps) {
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
            <View style={styles.bottomFade}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.readText}>{READ_LABEL}</Text>
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomFade: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  readText: {
    color: 'white',
    fontSize: 10,
    alignSelf: 'flex-end',
  },
});
