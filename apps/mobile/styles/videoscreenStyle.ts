import { Dimensions, Platform, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');

export const NUM_COLUMNS = 1;
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS + 2)) / NUM_COLUMNS;

export const createVideoScreenStyles = () =>
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
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.5,
    },
    searchBox: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    list: {
      padding: CARD_MARGIN,
    },
    cardContainer: {
      width: CARD_WIDTH,
      margin: CARD_MARGIN / 2,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#2A2A2A',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    cardImage: {
      width: '100%',
      height: CARD_WIDTH * (9 / 16),
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    titleContainer: {
      paddingHorizontal: 10,
    },
    cardTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.2,
      marginTop: 8,
      marginVertical: 22,
    },
    playerContainer: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closePlayer: {
      position: 'absolute',
      top: 60,
      right: 20,
      zIndex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      padding: 4,
    },
  });
