import { Platform, StyleSheet } from 'react-native';

export const createProfileStyles = () =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 40 : 0,
      paddingHorizontal: 0,
      alignItems: 'stretch',
      backgroundColor: '#f6f6f6',
    },
  });
