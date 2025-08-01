import { StyleSheet, Platform, Dimensions } from 'react-native';

export const { height: SCREEN_H } = Dimensions.get('window');
export const IMAGE_HEIGHT = SCREEN_H;
export const SHEET_HEIGHT = SCREEN_H * 0.53;

export const createArticleScreenStyles = () =>
  StyleSheet.create({
    // List view
    safeContainer: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    headerName: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingTop: 24,
      gap: 10,
      marginBottom: 8,
    },
    floatingBack: {
      marginRight: 12,
      padding: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: '#fff',
    },
    list: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    separator: {
      height: 12,
    },
    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    rowThumbnail: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    rowText: {
      flex: 1,
      padding: 12,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    rowMeta: {
      fontSize: 12,
      color: '#5AA5FF',
      marginTop: 4,
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
    // Detail view
    detailContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    imageWrapper: {
      width: '100%',
      height: IMAGE_HEIGHT,
      overflow: 'hidden',
    },
    detailImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: IMAGE_HEIGHT + SHEET_HEIGHT * 0.2,
      resizeMode: 'cover',
    },
    detailHeaderOverlay: {
      position: 'absolute',
      top: IMAGE_HEIGHT * 0.65,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: 170,
    },
    dragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 6,
    },
    detailTitle: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 8,
    },
    detailMeta: {
      color: '#5AA5FF',
      fontSize: 16,
      marginBottom: 16,
    },
    detailPreview: {
      color: '#EEE',
      fontSize: 16,
      lineHeight: 22,
    },
    swipeUpContainer: {
      position: 'absolute',
      top: IMAGE_HEIGHT * 0.55,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    swipeText: {
      color: '#fff',
      fontSize: 14,
      marginTop: 4,
    },
    detailBodyContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: SHEET_HEIGHT,
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    sheetHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    sheetTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#000',
      marginBottom: 4,
    },
    closeButton: {
      padding: 2,
      borderRadius: 20,
      marginVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderColor: '#5AA5FF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
      ...Platform.select({
        web: { backdropFilter: 'blur(12px)' },
        default: {},
      }),
    },
    sheetMeta: {
      fontSize: 14,
      fontWeight: '600',
      color: '#5AA5FF',
      marginBottom: 8,
    },
    detailBody: {
      color: '#333',
      fontSize: 18,
      lineHeight: 28,
      padding: 4,
    },
    detailBack: {
      position: 'absolute',
      top: Platform.OS === 'android' ? 32 : 48,
      left: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8,
    },
  });
