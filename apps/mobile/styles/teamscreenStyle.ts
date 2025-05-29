import { Platform, StyleSheet } from 'react-native';

export const createTeamsScreenStyles = () =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 40 : 0,
      paddingHorizontal: 16,
      backgroundColor: '#f6f6f6',
    },
    headerName: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      paddingTop: 20,
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 24,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#111',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      color: 'white',
      fontSize: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginHorizontal: 16,
      paddingBottom: 4,
    },
    listContent: {
      paddingBottom: 60,
    },
  });
