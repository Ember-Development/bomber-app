import { useState, useEffect, useRef, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { useChatMessages } from '@/api/groups/chat';
import { useLocalMessages } from '@/hooks/useLocalMessages';
import socket from '@/hooks/socket';
import { MessageFE } from '@bomber-app/database';

export function useChatMessagesWithOptimism(chatId: string) {
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatMessages(chatId);

  const serverMessages = useMemo(
    () => data?.pages.flat().reverse() ?? [],
    [data]
  );
  const local = useLocalMessages(serverMessages);

  const [messageText, setMessageText] = useState('');
  const currentUserId = '379cf0ba-a1fd-4df0-b2a3-5fc0649f137b'; // make dynamic later

  useEffect(() => {
    if (!chatId) return;
    if (!socket.connected) socket.connect();

    socket.emit('joinChat', chatId);

    const handleNewMessage = (newMessage: MessageFE) => {
      local.replaceLocalMessage(newMessage);
    };

    socket.on('NewMessage', handleNewMessage);

    return () => {
      socket.off('NewMessage', handleNewMessage);
    };
  }, [chatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  useKeyboardVisibility(scrollToBottom);

  // Send a new message
  const handleSendMessage = () => {
    if (!messageText.trim() || !chatId) return;

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
        primaryRole: 'ADMIN',
      },
      chat: {
        id: chatId,
        createdAt: new Date().toISOString() as unknown as Date,
        title: '',
      },
      failedToSend: false,
    };

    local.addLocalMessage(localMessage);

    // update groups list
    queryClient.setQueriesData({ queryKey: ['groups'] }, (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((groupPage: any[]) =>
          groupPage.map((group: any) => {
            if (group.id === chatId) {
              return {
                ...group,
                messages: [
                  {
                    id: tempId,
                    userID: currentUserId,
                    chatID: chatId,
                    text: messageText,
                    createdAt: new Date().toISOString(),
                  },
                  ...group.messages,
                ],
              };
            }
            return group;
          })
        ),
      };
    });

    // send to server
    socket.emit(
      'sendMessage',
      {
        text: messageText,
        chatId,
        userId: currentUserId,
      },
      (ack: { success: boolean }) => {
        if (!ack?.success) {
          local.replaceLocalMessage({ ...localMessage, failedToSend: true });
        } else {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
        }
      }
    );

    setMessageText('');
    scrollToBottom();
  };

  // Retry sending a failed message
  const handleRetrySendMessage = (msg: MessageFE) => {
    if (!chatId) return;

    socket.emit('sendMessage', {
      text: msg.text,
      chatId,
      userId: currentUserId,
    });

    local.replaceLocalMessage({
      ...msg,
      failedToSend: false,
    });
  };

  return {
    scrollViewRef,
    allMessages: local.localMessages,
    messageText,
    setMessageText,
    handleSendMessage,
    handleRetrySendMessage,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
