// src/screens/videos/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';

import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useAllMedia } from '@/hooks/media/useMedia';
import { Media as MediaFE } from '@bomber-app/database';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16;

export default function VideoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<'id'>();

  const { data: videos, isLoading } = useAllMedia();
  const [video, setVideo] = useState<MediaFE | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (videos && id) {
      const found = videos.find((v) => v.id === id) || null;
      setVideo(found);
    }
  }, [videos, id]);

  useEffect(() => {
    if (video) {
      setPlaying(true);
    }
  }, [video]);

  if (isLoading || !video) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#fff" />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  const vidId = video.videoUrl.match(/v=([^&]+)/)?.[1] || '';

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <YoutubePlayer
          height={PLAYER_HEIGHT}
          width={width}
          videoId={vidId}
          play={playing}
          initialPlayerParams={{ controls: true }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    borderRadius: 20,
  },
});
