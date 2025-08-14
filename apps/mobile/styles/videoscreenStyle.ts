import { StyleSheet, Dimensions, Platform } from 'react-native';
const { width } = Dimensions.get('window');

export const HORIZONTAL_PADDING = 16;
export const CATEGORY_ITEM_WIDTH = width * 0.4;
export const CARD_MARGIN = 12;
export const HERO_EXPANDED_HEIGHT = width * 0.6;

export const createVideoScreenStyles = () =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: HORIZONTAL_PADDING,
      paddingTop: 24,
    },
    backBtn: {
      marginRight: 12,
      padding: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
      color: '#fff',
      fontSize: 26,
      fontWeight: '700',
    },
    searchBox: {
      paddingHorizontal: HORIZONTAL_PADDING,
      marginBottom: 16,
    },
    scrollContainer: {
      paddingBottom: 24,
    },

    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      color: '#fff',
      fontSize: 14,
      letterSpacing: 2,
      marginHorizontal: HORIZONTAL_PADDING,
      marginBottom: 8,
      marginTop: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#fff',
    },

    // Hero
    heroContainer: {
      marginHorizontal: HORIZONTAL_PADDING,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
    },
    heroTouchable: {
      flex: 1,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    heroTitle: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      color: '#fff',
      fontSize: 32,
    },
    heroPlayIcon: {
      position: 'absolute',
      alignSelf: 'center',
      top: '40%',
    },

    // Category carousel
    carousel: {
      paddingHorizontal: HORIZONTAL_PADDING - CARD_MARGIN / 2,
    },
    card: {
      width: CATEGORY_ITEM_WIDTH,
      marginHorizontal: CARD_MARGIN / 2,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#1a1a1a',
    },
    cardImage: {
      width: '100%',
      height: CATEGORY_ITEM_WIDTH * 0.56,
    },
    cardOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    cardPlay: {
      position: 'absolute',
      alignSelf: 'center',
      top: '35%',
    },
    cardTitle: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
      marginHorizontal: 6,
      marginBottom: 8,
    },

    // Modal player
    playerContainer: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtn: {
      position: 'absolute',
      top: 60,
      right: 20,
      zIndex: 2,
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: 4,
      borderRadius: 20,
    },
  });
