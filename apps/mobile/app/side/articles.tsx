import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  InteractionManager,
  Pressable,
  Animated,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { useAllArticles, useArticleById } from '@/hooks/media/useArticle';
import type { ArticleDB as ArticleFE } from '@bomber-app/database';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------- Card ----------
const CARD_HEIGHT = 220;

const ArticleCard = React.memo(function ArticleCard({
  item,
  onPress,
}: {
  item: ArticleFE;
  onPress: (id: string) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale }],
        },
      ]}
      // Offload compositing to GPU for cheaper blurs/shadows
      renderToHardwareTextureAndroid
    >
      <Pressable
        onPress={() => onPress(item.id)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
        style={styles.cardTouchable}
      >
        {Boolean(item.imageUrl) && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: item.imageUrl! }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)']}
              style={styles.thumbnailGradient}
            />
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.cardDateChip}>
              <Ionicons name="calendar-outline" size={12} color="#8EB7FF" />
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.readMoreChip}>
              <Text style={styles.readMoreText}>Read</Text>
              <Ionicons name="arrow-forward" size={14} color="#8EB7FF" />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

// ---------- Skeleton ----------
const SkeletonCard = () => (
  <View style={[styles.cardWrapper, { overflow: 'hidden' }]}>
    <View style={styles.skelCard}>
      <View style={styles.skelThumb} />
      <View style={{ padding: 16, gap: 12 }}>
        <View style={styles.skelLineWide} />
        <View style={styles.skelLineMid} />
        <View style={styles.skelFooterRow}>
          <View style={styles.skelPill} />
          <View style={styles.skelPill} />
        </View>
      </View>
    </View>
  </View>
);

// ---------- Main ----------
export default function ArticlesScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openAfterInteractions = useRef<(id: string) => void>();

  const {
    data: articles = [],
    isLoading: listLoading,
    error: listError,
  } = useAllArticles();

  // Defer heavy modal open until after scroll/touch settles to avoid jank
  const handleOpen = useCallback((id: string) => {
    InteractionManager.runAfterInteractions(() => setSelectedId(id));
  }, []);

  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [articles]
  );

  // ---------- Detail Modal ----------
  const { data: article, isLoading: articleLoading } = useArticleById(
    selectedId || ''
  );

  const closeDetail = useCallback(() => setSelectedId(null), []);

  return (
    <BackgroundWrapper>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <BlurView intensity={60} tint="dark" style={styles.headerBlur}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>

              <View style={styles.headerTitles}>
                <Text style={styles.headerKicker}>Discover</Text>
                <Text style={styles.headerTitle}>Articles</Text>
              </View>

              {/* optional: filter/sort icon placeholder */}
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
                  <Ionicons name="filter-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>

        {/* List (FlashList) */}
        {listLoading ? (
          <View style={{ padding: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </View>
        ) : listError ? (
          <View style={styles.emptyContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle-outline" size={56} color="#ff6b6b" />
            </View>
            <Text style={styles.errorTitle}>Unable to load articles</Text>
            <Text style={styles.errorText}>
              Please pull to refresh or try again later.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedArticles}
            keyExtractor={(item: ArticleFE) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            renderItem={({ item }: { item: ArticleFE }) => (
              <ArticleCard item={item} onPress={handleOpen} />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={56}
                    color="#8EB7FF"
                  />
                </View>
                <Text style={styles.emptyTitle}>No Articles Yet</Text>
                <Text style={styles.emptyText}>
                  Check back soon for new content.
                </Text>
              </View>
            )}
          />
        )}

        {/* Detail Modal */}
        <Modal
          visible={!!selectedId}
          animationType="fade"
          presentationStyle="fullScreen"
        >
          <StatusBar barStyle="light-content" />
          <View style={styles.modalRoot}>
            {/* Hero */}
            {articleLoading || !article ? (
              <View
                style={[
                  styles.hero,
                  { justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <ActivityIndicator color="#8EB7FF" size="large" />
              </View>
            ) : (
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

                <TouchableOpacity
                  onPress={closeDetail}
                  style={styles.modalTopBar}
                >
                  <Ionicons name="close" size={22} color="#fff" />
                </TouchableOpacity>

                <View style={styles.titleChip}>
                  <Text style={styles.detailTitle}>{article.title}</Text>
                  <View style={styles.detailMetaRow}>
                    <View style={styles.metaPill}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#8EB7FF"
                      />
                      <Text style={styles.metaPillText}>
                        {new Date(article.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
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
            )}

            {/* Body */}
            <Animated.ScrollView
              style={{ flex: 1, backgroundColor: '#0a0a0a' }}
              contentContainerStyle={{ paddingBottom: 48 }}
              showsVerticalScrollIndicator={false}
            >
              {!articleLoading && article && (
                <>
                  <View style={styles.bodyCard}>
                    <Text style={styles.bodyText}>{article.body}</Text>
                  </View>

                  {article.link && (
                    <BlurView
                      intensity={60}
                      tint="dark"
                      style={styles.linkCard}
                    >
                      <TouchableOpacity
                        style={styles.linkBtn}
                        onPress={() => {
                          // router.push to webview screen if you have one:
                          // router.push({ pathname: "/web", params: { url: article.link } });
                        }}
                      >
                        <View style={styles.linkLeft}>
                          <View style={styles.linkIconWrap}>
                            <Ionicons
                              name="open-outline"
                              size={20}
                              color="#8EB7FF"
                            />
                          </View>
                          <View>
                            <Text style={styles.linkTitle}>
                              Continue Reading
                            </Text>
                            <Text style={styles.linkSub}>Open in browser</Text>
                          </View>
                        </View>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#8EB7FF"
                        />
                      </TouchableOpacity>
                    </BlurView>
                  )}
                </>
              )}
            </Animated.ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NgYGD4DwABWgG0M0KnbQAAAABJRU5ErkJggg==';

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  // Header
  headerContainer: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  headerBlur: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitles: { flex: 1 },
  headerKicker: {
    fontSize: 11,
    color: '#8EB7FF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // List
  listContent: { padding: 14, paddingBottom: 18 },
  cardWrapper: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardTouchable: { overflow: 'hidden' },
  thumbnailContainer: {
    width: '100%',
    height: CARD_HEIGHT - 80,
    position: 'relative',
    backgroundColor: '#0f0f12',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cardContent: { padding: 16, gap: 14 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 24 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDateChip: {
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
  cardDate: { fontSize: 12, color: '#8EB7FF', fontWeight: '600' },
  readMoreChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readMoreText: { fontSize: 14, color: '#8EB7FF', fontWeight: '600' },

  // Empty/Error
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(142,183,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(142,183,255,0.25)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  emptyText: { fontSize: 14, color: '#a3a3a3', textAlign: 'center' },
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

  // Skeletons
  skelCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skelThumb: {
    height: CARD_HEIGHT - 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skelLineWide: {
    height: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skelLineMid: {
    height: 12,
    width: '70%',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skelFooterRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  skelPill: {
    height: 22,
    width: 80,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
