import { StyleSheet } from 'react-native';
import { Colors, GlobalColors } from '@/constants/Colors';

export const createMessageStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    headerContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 15,
    },
    backButton: {
      marginRight: 10,
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
    chatTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    senderName: {
      fontSize: 12,
      fontWeight: 'bold',
      color: GlobalColors.dark,
      marginBottom: 2,
      marginLeft: 50,
    },
    messageWrapper: {
      marginBottom: 12,
    },
    messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    otherMessage: {
      justifyContent: 'flex-start',
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 20,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
      marginTop: 10,
    },
    userAvatar: {
      backgroundColor: GlobalColors.white,
      borderColor: GlobalColors.dark,
      borderWidth: 1,
    },
    otherAvatar: {
      backgroundColor: GlobalColors.black,
    },
    avatarText: {
      fontWeight: 'bold',
      fontSize: 12,
    },
    otherInitial: {
      color: GlobalColors.white,
    },
    userInitial: {
      color: GlobalColors.black,
    },
    messageBubble: {
      maxWidth: '75%',
      padding: 10,
      borderRadius: 10,
      marginTop: 5,
    },
    userBubble: {
      backgroundColor: GlobalColors.black,
      alignSelf: 'flex-end',
    },
    otherBubble: {
      backgroundColor: GlobalColors.white,
      borderWidth: 1,
      borderColor: GlobalColors.dark,
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: 14,
    },
    userText: {
      color: GlobalColors.white,
    },
    otherText: {
      color: GlobalColors.black,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 30,
      backgroundColor: GlobalColors.white,
      shadowColor: '#000',
      shadowOpacity: 10,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    input: {
      flex: 1,
      padding: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: GlobalColors.black,
      marginRight: 10,
      minHeight: 40,
      maxHeight: 120,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: GlobalColors.black,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateHeader: {
      alignSelf: 'center',
      marginVertical: 10,
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderRadius: 20,
    },
    dateHeaderText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: GlobalColors.black,
    },
    noMessageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
      padding: 20,
      borderRadius: 20,
      marginHorizontal: 20,
    },
  });

export default createMessageStyles;
