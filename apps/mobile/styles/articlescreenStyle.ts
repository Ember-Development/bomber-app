import { Platform, StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
export const createArticleScreenStyles = () =>
  StyleSheet.create({
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
    },
    floatingBack: {
      marginRight: 12,
      padding: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
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
      marginBottom: 12,
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
    detailContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    detailImage: {
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
    },
    detailHeaderOverlay: {
      position: 'absolute',
      top: height * 0.65,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: 170,
    },
    detailTitle: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 8,
    },
    detailMeta: {
      color: '#ddd',
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
      top: height * 0.55,
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
      height: height * 0.5,
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
      fontSize: 20,
      fontWeight: '700',
      color: '#000',
      marginBottom: 4,
    },
    sheetMeta: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
    },
    detailBody: {
      color: '#333',
      fontSize: 18,
      lineHeight: 28,
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
