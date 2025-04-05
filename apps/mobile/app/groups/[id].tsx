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
  Image,
  InteractionManager,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useChatMessages, useChatDetails } from '@/api/chat';
import { MessageFE, UserRole } from '@bomber-app/database';
import { Ionicons } from '@expo/vector-icons';
import { createMessageStyles } from './styles';
import CustomButton from '@/components/ui/atoms/Button';
import {
  formatMessageDate,
  getInitials,
  shouldShowDateHeader,
} from '@/utils/chatUtils';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { ThemedText } from '@/components/ThemedText';
import BottomSheetModal from '@/components/ui/organisms/BottomSheetModal';
import { useAddUsersToGroup, useUsersInGroup } from '@/hooks/useChats';
import CreateGroupModal from '@/components/groups/AddGroupModal';
import { ChatUser } from '@/types'; // Make sure you import this type
import socket from '@/hooks/socket';
import { useLocalMessages } from '@/hooks/useLocalMessages';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const chatId = Array.isArray(id) ? id[0] : id;
  const scrollViewRef = useRef<ScrollView>(null);
  const iconColor = useThemeColor({}, 'icon');
  const styles = createMessageStyles('light');
  const component = useThemeColor({}, 'component');

  const { data: users = [], isLoading: isUsersLoading } =
    useUsersInGroup(chatId);
  const {
    data,
    isLoading: messageLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(chatId);
  const messages: MessageFE[] = data?.pages.flat().reverse() || [];
  const { data: chatDetails, isLoading: chatLoading } = useChatDetails(chatId);
  const { mutate: addUsersToGroup } = useAddUsersToGroup();

  const sortedMessages = data?.pages.flat().reverse() ?? [];
  const {
    localMessages,
    addLocalMessage,
    replaceLocalMessage,
    clearLocalMessages,
    allMessages,
  } = useLocalMessages(sortedMessages);

  const currentUserId = '550e8400-e29b-41d4-a716-446655440000';

  const [messageText, setMessageText] = useState('');
  const [showUsers, SetShowUsers] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);

  // useEffects
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit('joinChat', chatId);

    socket.on('NewMessage', (newMessage: MessageFE) => {
      console.log('New message received:', newMessage);
      replaceLocalMessage(newMessage);
      addLocalMessage(newMessage);
    });

    return () => {
      socket.off('NewMessage');
    };
  }, [chatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  useKeyboardVisibility(scrollToBottom);

  const handleSendMessage = () => {
    if (messageText.trim() !== '' && chatId) {
      const tempId = `${Date.now()}-temp`;

      const localMessage: MessageFE = {
        id: tempId,
        text: messageText,
        chatID: chatId,
        userID: currentUserId,
        createdAt: new Date().toISOString() as unknown as Date,
        sender: {
          id: currentUserId,
          email: '',
          phone: null,
          pass: '',
          fname: 'Temp',
          lname: 'User',
          primaryRole: 'PLAYER',
        },
        chat: {
          id: chatId,
          createdAt: new Date(),
          title: '',
        },
      };

      addLocalMessage(localMessage);

      socket.emit('sendMessage', {
        text: messageText,
        chatId,
        userId: currentUserId,
      });
      setMessageText('');
      scrollToBottom();
    }
  };

  const handleAddUsersToGroup = (userIds: string[]) => {
    if (!chatId) return;

    addUsersToGroup(
      { groupId: chatId, userIds },
      {
        onSuccess: () => {
          setAddUserModal(false);
        },
        onError: (err: any) => {
          console.error('Failed to add users:', err);
        },
      }
    );
  };

  // Group users by role
  const groupedUsers = users
    .filter((u: { primaryRole: any }) => u.primaryRole)
    .reduce(
      (acc: Record<UserRole, ChatUser[]>, user: ChatUser) => {
        (acc[user.primaryRole] = acc[user.primaryRole] || []).push(user);
        return acc;
      },
      {} as Record<UserRole, ChatUser[]>
    );

  const roleOrder: UserRole[] = ['PLAYER', 'COACH', 'FAN', 'ADMIN'];

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: 'white' }}
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 50 }}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/groups')}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text
                style={[styles.chatTitle, { flexShrink: 1 }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {chatLoading
                  ? 'Loading...'
                  : chatDetails?.title || 'Group Chat'}
              </Text>
              <View style={styles.iconContainer}>
                <View
                  style={[
                    styles.buttonContainer,
                    { backgroundColor: component },
                  ]}
                >
                  <CustomButton
                    variant="icon"
                    iconName="volume-mute"
                    onPress={() => {}}
                  />
                </View>
                <View
                  style={[
                    styles.buttonContainer,
                    { backgroundColor: component },
                  ]}
                >
                  <CustomButton
                    variant="icon"
                    iconName="people"
                    onPress={() => SetShowUsers(true)}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ padding: 10 }}
            onContentSizeChange={scrollToBottom}
            onScroll={({ nativeEvent }) => {
              if (
                nativeEvent.contentOffset.y <= 0 &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage();
              }
            }}
            scrollEventThrottle={400}
          >
            {messageLoading ? (
              <ActivityIndicator size="large" color={iconColor} />
            ) : sortedMessages && sortedMessages.length === 0 ? (
              <View style={styles.noMessageContainer}>
                <Image
                  source={require('@/styles/images/bubble-msg.png')}
                  style={{ width: 120, height: 120, marginBottom: 20 }}
                  resizeMode="contain"
                />
                <ThemedText
                  style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}
                >
                  Start Sending Messages Now
                </ThemedText>
                <CustomButton
                  title="Add People to Group"
                  onPress={() => setAddUserModal(true)}
                />
              </View>
            ) : (
              allMessages?.map((msg: MessageFE, index: number) => {
                const isUser = msg.sender.id === currentUserId;
                const initials = getInitials(
                  msg.sender.fname,
                  msg.sender.lname
                );

                return (
                  <View key={msg.id} style={styles.messageWrapper}>
                    {shouldShowDateHeader(messages, index) && (
                      <View style={styles.dateHeader}>
                        <Text style={styles.dateHeaderText}>
                          {formatMessageDate(msg.createdAt)}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.senderName}>
                      {msg.sender.fname} {msg.sender.lname}
                    </Text>
                    <View
                      style={[
                        styles.messageContainer,
                        isUser ? styles.userMessage : styles.otherMessage,
                      ]}
                    >
                      {!isUser && (
                        <View style={[styles.avatar, styles.otherAvatar]}>
                          <Text
                            style={[styles.avatarText, styles.otherInitial]}
                          >
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

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              onFocus={scrollToBottom}
              multiline
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

          {/* Users Modal */}
          <BottomSheetModal
            isVisible={showUsers}
            onClose={() => SetShowUsers(false)}
            title="Members"
          >
            <View style={{ marginTop: 10 }}>
              {isUsersLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <View style={{ maxHeight: '99%' }}>
                  <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
                    {roleOrder.map((role) => {
                      const usersForRole = groupedUsers[role];
                      if (!usersForRole || usersForRole.length === 0)
                        return null;

                      return (
                        <View key={role} style={{ marginBottom: 20 }}>
                          <Text
                            style={{
                              fontWeight: '700',
                              fontSize: 18,
                              marginBottom: 8,
                            }}
                          >
                            {role.charAt(0) + role.slice(1).toLowerCase()}s
                          </Text>

                          {usersForRole
                            .slice()
                            .sort(
                              (a: { fname: string }, b: { fname: string }) =>
                                a.fname.localeCompare(b.fname)
                            )
                            .map((user: ChatUser) => (
                              <TouchableOpacity
                                key={user.id}
                                style={{
                                  padding: 15,
                                  backgroundColor: '#eee',
                                  marginBottom: 10,
                                  borderRadius: 10,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: '500',
                                      marginRight: 8,
                                    }}
                                  >
                                    {user.fname} {user.lname}
                                  </Text>
                                  <View
                                    style={{
                                      backgroundColor: '#D1E8FF',
                                      paddingHorizontal: 8,
                                      paddingVertical: 2,
                                      borderRadius: 12,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        color: '#0366d6',
                                        fontWeight: '600',
                                      }}
                                    >
                                      {user.primaryRole}
                                    </Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            ))}
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Pinned Buttons */}
                  <View
                    style={{
                      padding: 20,
                      borderTopWidth: 0.5,
                      borderColor: '#ccc',
                      backgroundColor: 'white',
                    }}
                  >
                    <CustomButton
                      title="Add Person to Group"
                      onPress={() => {
                        if (chatDetails) {
                          SetShowUsers(false);
                          InteractionManager.runAfterInteractions(() => {
                            setAddUserModal(true);
                          });
                        }
                      }}
                    />
                    <CustomButton
                      title="End Group"
                      variant="danger"
                      onPress={() => alert('Canceled!')}
                    />
                  </View>
                </View>
              )}
            </View>
          </BottomSheetModal>
        </View>
      </KeyboardAvoidingView>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={addUserModal}
        groupName={chatDetails?.title || ''}
        onClose={() => setAddUserModal(false)}
        onCreate={handleAddUsersToGroup}
        existingGroupUserIds={
          chatDetails?.users?.map((u: { userID: any }) => u.userID) ?? []
        }
        isEditMode
      />
    </>
  );
}
