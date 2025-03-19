import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useChatMessages, useChatDetails } from '@/api/chat';
import { MessageFE } from '@bomber-app/database';
import { Ionicons } from '@expo/vector-icons';
import { createMessageStyles } from './styles';
import CustomButton from '@/components/ui/atoms/Button';
import {
  formatMessageDate,
  getInitials,
  shouldShowDateHeader,
  shouldShowSenderName,
} from '@/utils/chatUtils';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const chatId = Array.isArray(id) ? id[0] : id;
  const scrollViewRef = useRef<ScrollView>(null);
  const iconColor = useThemeColor({}, 'icon');
  const styles = createMessageStyles('light');
  const component = useThemeColor({}, 'component');

  // React Query Hooks
  const { data: messages, isLoading: messageLoading } = useChatMessages(chatId);
  const { data: chatDetails, isLoading: chatLoading } = useChatDetails(chatId);

  // Mock user UUID
  const currentUserId = '550e8400-e29b-41d4-a716-446655440000';

  // Input state
  const [messageText, setMessageText] = useState('');

  // remove expo header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  useKeyboardVisibility(scrollToBottom);

  const handleSendMessage = () => {
    if (messageText.trim() !== '') {
      console.log('Sending Message:', messageText);
      setMessageText('');
      scrollToBottom();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 50 }}>
          {/* Chat Title and Back Button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/groups')}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>
              {chatLoading ? 'Loading...' : chatDetails?.title || 'Group Chat'}
            </Text>
            <View style={styles.iconContainer}>
              <View
                style={[styles.buttonContainer, { backgroundColor: component }]}
              >
                <CustomButton
                  variant="icon"
                  iconName="volume-mute"
                  onPress={() => {}}
                />
              </View>
              <View
                style={[styles.buttonContainer, { backgroundColor: component }]}
              >
                <CustomButton
                  variant="icon"
                  iconName="people"
                  onPress={() => alert('Searching!')}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={scrollToBottom}
        >
          {messageLoading ? (
            <ActivityIndicator size="large" color={iconColor} />
          ) : (
            messages?.map((msg: MessageFE, index) => {
              const isUser = msg.sender.id === currentUserId;
              const initials = getInitials(msg.sender.fname, msg.sender.lname);

              return (
                <View key={msg.id} style={styles.messageWrapper}>
                  {shouldShowDateHeader(messages, index) && (
                    <View style={styles.dateHeader}>
                      <Text style={styles.dateHeaderText}>
                        {formatMessageDate(msg.createdAt)}
                      </Text>
                    </View>
                  )}

                  {shouldShowSenderName(messages, index, currentUserId) && (
                    <Text style={styles.senderName}>
                      {msg.sender.fname} {msg.sender.lname}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.messageContainer,
                      isUser ? styles.userMessage : styles.otherMessage,
                    ]}
                  >
                    {!isUser && (
                      <View style={[styles.avatar, styles.otherAvatar]}>
                        <Text style={[styles.avatarText, styles.otherInitial]}>
                          {initials}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.otherBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isUser ? styles.userText : styles.otherText,
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                    {isUser && (
                      <View style={[styles.avatar, styles.userAvatar]}>
                        <Text style={[styles.avatarText, styles.userInitial]}>
                          {initials}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            onFocus={scrollToBottom}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
