import { StyleSheet } from 'react-native';
import { Colors, GlobalColors } from '@/constants/Colors';

export const createGroupStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    buttonContainer: {
      backgroundColor:
        theme === 'light' ? Colors.light.component : Colors.dark.component,
      borderRadius: 4,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    iconContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 10,
      marginLeft: 10,
    },
    groupItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: 20,
      marginHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    textContainer: {
      flexDirection: 'column',
      flex: 1,
      gap: 8,
    },
    groupText: {
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    messageText: {
      fontSize: 12,
      marginTop: 2,
    },
    timeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeText: {
      fontSize: 12,
      marginLeft: 10,
      color: GlobalColors.gray,
    },
    actionContainer: {
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
    },
    muteIcon: {
      marginTop: 16,
    },
    muteButton: {
      backgroundColor: GlobalColors.dark,
      justifyContent: 'center',
      alignItems: 'center',
      width: 100,
      height: '100%',
    },
    muteText: {
      fontWeight: 'semibold',
      color: GlobalColors.white,
    },
    mutedText: {
      color: GlobalColors.gray,
    },
    leaveButton: {
      backgroundColor: GlobalColors.red,
      justifyContent: 'center',
      alignItems: 'center',
      width: 100,
      height: '100%',
    },
    leaveText: {
      fontWeight: 'semibold',
      color: GlobalColors.white,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },
    noGroupsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    noGroupsText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#888',
    },
    groupTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    unreadIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'red',
      marginRight: 8,
    },
    glassCard: {
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 20,
      overflow: 'hidden',
      padding: 16,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
