import { useState, useEffect, useRef, useMemo } from 'react';
import { useChatMessages } from '@/api/chat';
import { MessageFE } from '@bomber-app/database';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { useLocalMessages } from '@/hooks/useLocalMessages';
import socket from '@/hooks/socket';
import { useQueryClient } from '@tanstack/react-query';

export function useChatMessagesWithOptimism(chatId: string) {
  const scrollViewRef = useRef<any>(null);
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

  // connect socket
  useEffect(() => {
    if (!chatId) return;
    if (!socket.connected) socket.connect();
    socket.emit('joinChat', chatId);

    socket.on('NewMessage', (newMessage: MessageFE) => {
      local.replaceLocalMessage(newMessage);
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
          primaryRole: 'ADMIN',
        },
        chat: {
          id: chatId,
          createdAt: new Date().toISOString() as unknown as Date,
          title: '',
        },
        failedToSend: false,
      };

      console.log('📤 Adding local message:', localMessage);
      local.addLocalMessage(localMessage);

      // Optimistically update groups list
      queryClient.setQueriesData({ queryKey: ['groups'] }, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((groupPage: any[]) =>
            groupPage.map((group: any) => {
              if (group.id === chatId) {
                const newGroup = {
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
                return newGroup;
              }
              return group;
            })
          ),
        };
      });

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
    }
  };

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
