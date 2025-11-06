import React, { useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';

import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useArticleById } from '@/hooks/media/useArticle';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ArticleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = (params.id as string) || '';
  const { data: article, isLoading, error } = useArticleById(id || '');

  // Defer heavy modal open until after scroll/touch settles to avoid jank
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <BackgroundWrapper>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.emptyContainer}>
            <ActivityIndicator color="#8EB7FF" size="large" />
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <BackgroundWrapper>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={56} color="#ff6b6b" />
            <Text style={styles.errorTitle}>Unable to load article</Text>
            <Text style={styles.errorText}>Please try again later.</Text>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <StatusBar barStyle="light-content" />
      <View style={styles.modalRoot}>
        {/* Hero */}
        <View style={styles.hero}>
          {Boolean(article.imageUrl) && (
            <>
              <Image
                source={{ uri: article.imageUrl! }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <LinearGradient
                colors={[
                  'rgba(0,0,0,0.0)',
                  'rgba(0,0,0,0.6)',
                  'rgba(0,0,0,0.95)',
                ]}
                style={StyleSheet.absoluteFill}
              />
            </>
          )}

          <TouchableOpacity onPress={handleClose} style={styles.modalTopBar}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleChip}>
            <Text style={styles.detailTitle}>{article.title}</Text>
            <View style={styles.detailMetaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="calendar-outline" size={14} color="#8EB7FF" />
                <Text style={styles.metaPillText}>
                  {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="time-outline" size={14} color="#8EB7FF" />
                <Text style={styles.metaPillText}>
                  {Math.max(
                    1,
                    Math.ceil(article.body.split(/\s+/).length / 220)
                  )}{' '}
                  min read
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Body */}
        <Animated.ScrollView
          style={{ flex: 1, backgroundColor: '#0a0a0a' }}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{article.body}</Text>
          </View>

          {article.link && (
            <BlurView intensity={60} tint="dark" style={styles.linkCard}>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => Linking.openURL(article.link!)}
              >
                <View style={styles.linkLeft}>
                  <View style={styles.linkIconWrap}>
                    <Ionicons name="open-outline" size={20} color="#8EB7FF" />
                  </View>
                  <View>
                    <Text style={styles.linkTitle}>Continue Reading</Text>
                    <Text style={styles.linkSub}>Open in browser</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#8EB7FF" />
              </TouchableOpacity>
            </BlurView>
          )}
        </Animated.ScrollView>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  // Empty/Error
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,107,107,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  errorText: { fontSize: 14, color: '#a3a3a3', textAlign: 'center' },

  // Modal / Detail
  modalRoot: { flex: 1, backgroundColor: '#0a0a0a' },
  hero: {
    height: SCREEN_HEIGHT * 0.45,
    width: '100%',
    backgroundColor: '#0f0f12',
  },
  modalTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  titleChip: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  detailTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  detailMetaRow: { flexDirection: 'row', gap: 10 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(142,183,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(142,183,255,0.25)',
  },
  metaPillText: { fontSize: 12, color: '#8EB7FF', fontWeight: '600' },
  bodyCard: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#E8E8E8',
    letterSpacing: 0.2,
  },

  linkCard: {
    marginTop: 14,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(142,183,255,0.25)',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(142,183,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(142,183,255,0.25)',
  },
  linkTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  linkSub: { fontSize: 12, color: '#8EB7FF' },
});
