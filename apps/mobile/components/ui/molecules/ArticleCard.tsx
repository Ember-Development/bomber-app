import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
} from 'react-native';

interface ArticleCardProps {
  image: any;
  title: string;
  onPress: () => void;
}

export default function ArticleCard({
  image,
  title,
  onPress,
}: ArticleCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <ImageBackground
        source={image}
        style={styles.image}
        imageStyle={{ borderRadius: 20 }}
      >
        <View style={styles.bottomFade}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.readText}>READ ARTICLE</Text>
        </View>
      </ImageBackground>
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
