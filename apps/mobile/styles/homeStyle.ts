import { Platform, StyleSheet } from 'react-native';
import { Colors, GlobalColors } from '@/constants/Colors';

export const createHomeStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 40 : 0,
      paddingHorizontal: 0,
      alignItems: 'stretch',
      backgroundColor: '#f6f6f6',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 20,
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
      marginVertical: 10,
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
      marginVertical: 10,
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
      marginVertical: 10,
    },
    legacy: {
      flexDirection: 'column',
      paddingHorizontal: 20,
      marginVertical: 15,
    },
    legacyList: {
      marginTop: 16,
      width: '100%',
      flexDirection: 'column',
      gap: 8,
    },
    legacyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 16,
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    iconWrapper: {
      backgroundColor: '#bebebe',
      padding: 8,
      borderRadius: 50,
      marginRight: 12,
    },
    legacyText: {
      flexDirection: 'column',
      gap: 8,
    },
    mediaSection: {
      flexDirection: 'column',
      paddingHorizontal: 20,
      marginVertical: 10,
    },
  });
