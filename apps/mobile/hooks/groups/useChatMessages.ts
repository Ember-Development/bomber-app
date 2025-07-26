import { useState, useEffect, useRef, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { retryMessage, useChatMessages } from '@/api/groups/chat';
import { useLocalMessages } from '@/hooks/useLocalMessages';
import socket from '@/hooks/socket';
import { MessageFE } from '@bomber-app/database';
import { useNormalizedUser } from '@/utils/user';

export function useChatMessagesWithOptimism(chatId: string) {
  const scrollViewRef = useRef<ScrollView>(null);
  const isNearBottom = useRef(true);
  const isPaginating = useRef(false);
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatMessages(chatId);

  const serverMessages = useMemo(() => {
    const allMessages = data?.pages.flatMap((page) => page) ?? [];
    return allMessages.slice().reverse();
  }, [data]);
  const local = useLocalMessages(serverMessages);

  const [messageText, setMessageText] = useState('');
  const { user } = useNormalizedUser();
  const currentUserId = user?.id;

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
    }, 100);
  };

  useKeyboardVisibility(scrollToBottom);

  // Send a new message
  const handleSendMessage = () => {
    if (!messageText.trim() || !chatId || !user?.id) return;

    const tempId = `${Date.now()}-temp`;

    // TODO: replace with real user data
    const localMessage: MessageFE = {
      id: tempId,
      text: messageText,
      chatID: chatId,
      userID: user?.id || '',
      createdAt: new Date(),
      sender: {
        id: user?.id || '',
        email: user?.email || '',
        phone: user?.phone || null,
        pass: '',
        fname: user?.fname || '',
        lname: user?.lname || '',
        primaryRole: user?.primaryRole || 'PLAYER',
        isDeleted: false,
      },
      chat: {
        id: chatId,
        createdAt: new Date(),
        title: '',
        lastMessageAt: new Date(),
      },
      failedToSend: false,
      retryCount: 0,
    };

    local.addLocalMessage(localMessage);

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

  // Retry failed message
  const handleRetrySendMessage = (msg: MessageFE) => {
    if (!chatId) return;
    if (!currentUserId) return;

    const payload = {
      messageId: msg.id,
      chatId,
      userId: currentUserId,
    };

    // Use socket if connected, fallback to REST
    if (socket.connected) {
      socket.emit('retryMessage', payload);
    } else {
      retryMessage(payload).catch((err) => {
        console.error('Retry message failed via REST:', err);
      });
    }

    queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
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
    isNearBottom,
    isPaginating,
  };
}
