import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';

import SearchField from '@/components/ui/atoms/Search';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useAllMedia } from '@/hooks/media/useMedia';
import { Media as MediaFE } from '@bomber-app/database';
import {
  createVideoScreenStyles,
  NUM_COLUMNS,
} from '@/styles/videoscreenStyle';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16; // 16:9 aspect ratio

export default function VideosScreen() {
  const router = useRouter();
  const styles = createVideoScreenStyles();

  // Fetch from backend
  const { data: videos, isLoading } = useAllMedia();

  // Local UI state
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaFE | null>(null);

  // Filter on title
  const filtered = useMemo(() => {
    if (!videos) return [];
    return videos.filter((v) =>
      v.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [videos, searchText]);

  // Extract YouTube ID
  const getVideoId = (url: string) => {
    const m = url.match(/v=([^&]+)/);
    return m ? m[1] : '';
  };

  // Render loading spinner
  if (isLoading) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={styles.safeContainer}>
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 40 }}
          />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeContainer}>
        {/* Header */}
        <View style={styles.headerName}>
          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Explore Videos</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <SearchField
            placeholder="Search videos..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Video Grid */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={[
            styles.list,
            filtered.length === 0 && {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          renderItem={({ item }) => {
            const thumbnail = `https://img.youtube.com/vi/${getVideoId(item.videoUrl)}/hqdefault.jpg`;
            return (
              <>
                <TouchableOpacity
                  style={styles.cardContainer}
                  onPress={() => setSelectedItem(item)}
                >
                  <Image source={{ uri: thumbnail }} style={styles.cardImage} />
                  <View style={styles.overlay}>
                    <Ionicons name="play-circle" size={50} color="#5AA5FF" />
                  </View>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text numberOfLines={2} style={styles.cardTitle}>
                    {item.title}
                  </Text>
                </View>
              </>
            );
          }}
          ListEmptyComponent={() => (
            <View style={{ padding: 20 }}>
              <Text
                style={{ color: '#fff', fontSize: 18, textAlign: 'center' }}
              >
                No videos found.
              </Text>
            </View>
          )}
        />

        {/* Video Player Modal */}
        <Modal
          visible={!!selectedItem}
          animationType="slide"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.playerContainer}>
            <TouchableOpacity
              style={styles.closePlayer}
              onPress={() => setSelectedItem(null)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {selectedItem && (
              <YoutubePlayer
                height={PLAYER_HEIGHT}
                width={width}
                videoId={getVideoId(selectedItem.videoUrl)}
                play
                initialPlayerParams={{ controls: true }}
              />
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
