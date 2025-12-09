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
      paddingVertical: 12,
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
      marginBottom: 12,
    },
    filtersContainer: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 4,
    },
    filtersHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    filtersHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filtersHeaderText: {
      fontSize: 15,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.9)',
    },
    activeFiltersBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    activeFiltersBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    filtersContent: {
      paddingTop: 8,
      paddingBottom: 12,
      paddingHorizontal: 14,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
    },
    filterSection: {
      marginBottom: 12, // Reduced from 20
    },
    filterLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8, // Reduced from 10
      paddingHorizontal: 0, // Removed horizontal padding
    },
    filterLabel: {
      fontSize: 13, // Slightly smaller
      fontWeight: '600',
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 6,
      paddingHorizontal: 0,
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
      marginRight: 12,
      padding: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  });
