import { Platform, StyleSheet } from 'react-native';

export const createHomeStyles = () =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 40 : 0,
      paddingHorizontal: 0,
      alignItems: 'stretch',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 25,
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    titleText: {
      flexDirection: 'column',
      gap: 8,
    },
    quickAction: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
      paddingHorizontal: 20,
      marginVertical: 6,
    },
    myActions: {
      width: '50%',
      gap: 4,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    notifications: {
      width: '50%',
    },
    event: {
      flexDirection: 'column',
      paddingHorizontal: 20,
      marginVertical: 6,
    },
    EventText: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    groups: {
      flexDirection: 'column',
      paddingHorizontal: 20,
      marginVertical: 6,
    },
    legacy: {
      flexDirection: 'column',
      paddingHorizontal: 20,
      marginVertical: 15,
    },
    legacyList: {
      marginTop: 5,
      width: '100%',
      flexDirection: 'column',
      gap: 8,
    },
    legacyPressable: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    legacyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 20,
      padding: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
      ...(Platform.OS === 'android'
        ? { backgroundColor: 'rgba(12, 28, 48, 0.9)' }
        : null),
    },
    legacyItems: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
    },
    legacyText: {
      gap: 4,
      marginBottom: 12,
    },
    mediaSection: {
      flexDirection: 'column',
      paddingHorizontal: 20,
      marginVertical: 10,
    },
    articlesSection: {
      marginBottom: 24,
    },
    becomeBomber: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    bomberCard: {
      marginTop: 12,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    bomberImage: {
      width: '100%',
      height: 180,
      borderRadius: 16,
    },
    bomberOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: 30,
      overflow: 'hidden',
    },
    bomberText: {
      color: '#fff',
      fontSize: 16,
      letterSpacing: 1,
    },
    bomberFadeTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 20, // small soft fade height
      zIndex: 2, // on top of the blur
    },
  });
