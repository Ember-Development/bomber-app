import { Platform, StyleSheet } from 'react-native';

export const createTeamsScreenStyles = () =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    headerName: {
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
      color: 'white',
    },
    searchBox: {
      marginTop: 10,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.2)',
      marginHorizontal: 16,
      paddingBottom: 4,
    },
    listContent: {
      paddingBottom: 60,
      paddingHorizontal: 16,
    },
    floatingBack: {
      backgroundColor: '#fff',
      padding: 8,
      borderRadius: 18,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
  });
