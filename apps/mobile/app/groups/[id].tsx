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
import React, { useEffect, useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { createMessageStyles } from './styles';
import CustomButton from '@/components/ui/atoms/Button';
import {
  getInitials,
  shouldShowDateHeader,
  formatMessageDate,
} from '@/utils/chatUtils';
import { useUsersInGroup, useAddUsersToGroup } from '@/hooks/useChats';
import { useChatDetails } from '@/api/chat';
import { useChatMessagesWithOptimism } from '@/hooks/useChatMessages';
import { ChatUser, UserRole } from '@/types';
import { ThemedText } from '@/components/ThemedText';
import BottomSheetModal from '@/components/ui/organisms/BottomSheetModal';
import CreateGroupModal from '@/components/groups/AddGroupModal';
import { Ionicons } from '@expo/vector-icons';
import { MessageFE } from '@bomber-app/database';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const chatId = Array.isArray(id) ? id[0] : id;
  const styles = createMessageStyles('light');
  const component = useThemeColor({}, 'component');
  const iconColor = useThemeColor({}, 'icon');

  const { data: users = [], isLoading: isUsersLoading } =
    useUsersInGroup(chatId);
  const { data: chatDetails, isLoading: chatLoading } = useChatDetails(chatId);
  const { mutate: addUsersToGroup } = useAddUsersToGroup();

  const {
    scrollViewRef,
    allMessages,
    messageText,
    setMessageText,
    handleSendMessage,
    handleRetrySendMessage,
    isLoading: messageLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessagesWithOptimism(chatId);

  const [showUsers, setShowUsers] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleAddUsersToGroup = (userIds: string[]) => {
    if (!chatId) return;
    addUsersToGroup(
      { groupId: chatId, userIds },
      {
        onSuccess: () => setAddUserModal(false),
        onError: (err: any) => console.error('Failed to add users:', err),
      }
    );
  };

  const groupedUsers = users
    .filter((u) => u.primaryRole)
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
                    onPress={() => setShowUsers(true)}
                  />
                </View>
              </View>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ padding: 10 }}
            onContentSizeChange={() => {
              setTimeout(
                () => scrollViewRef.current?.scrollToEnd({ animated: true }),
                200
              );
            }}
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
            ) : !allMessages || allMessages.length === 0 ? (
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
                console.log('💬 Right here bitch Message:', msg.text, msg.id);
                const isUser =
                  msg.sender.id === '379cf0ba-a1fd-4df0-b2a3-5fc0649f137b';
                const initials = getInitials(
                  msg.sender.fname,
                  msg.sender.lname
                );

                return (
                  <View key={msg.id} style={styles.messageWrapper}>
                    {shouldShowDateHeader(allMessages, index) && (
                      <View style={styles.dateHeader}>
                        <Text style={styles.dateHeaderText}>
                          {formatMessageDate(msg.createdAt)}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        style={[
                          styles.senderName,
                          isUser ? { marginRight: 10 } : { marginLeft: 50 },
                        ]}
                      >
                        {msg.sender.fname} {msg.sender.lname}
                      </Text>
                    </View>
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

                        {msg.failedToSend && (
                          <TouchableOpacity
                            onPress={() => handleRetrySendMessage(msg)}
                            style={{ marginTop: 2 }}
                          >
                            <Text
                              style={{
                                color: 'red',
                                fontSize: 10,
                                textDecorationLine: 'underline',
                              }}
                            >
                              Failed to send - Tap to retry
                            </Text>
                          </TouchableOpacity>
                        )}
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
              onFocus={() => {
                setTimeout(
                  () => scrollViewRef.current?.scrollToEnd({ animated: true }),
                  200
                );
              }}
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

          <BottomSheetModal
            isVisible={showUsers}
            onClose={() => setShowUsers(false)}
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
                          setShowUsers(false);
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
