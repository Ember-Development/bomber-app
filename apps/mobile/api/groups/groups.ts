import { useQuery, useMutation } from '@tanstack/react-query';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const fetchMessages = async (chatId: string) => {
  const response = await fetch(`http://localhost:3000/api/messages/${chatId}`);
  return response.json();
};

const fetchGroups = async () => {
  const response = await fetch(`http://localhost:3000/api/chats`);
  return response.json();
};

export const useGroupMessages = (chatId: string) => {
  return useQuery({
    queryKey: ['groupMessages', chatId],
    queryFn: () => fetchMessages(chatId),
    staleTime: 1000 * 30,
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: (newMessage: {
      text: string;
      chatId: string;
      userId: string;
    }) => {
      return new Promise<void>((resolve, reject) => {
        socket.emit('sendMessage', newMessage, (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    },
  });
};

export const useCreateGroup = () => {
  return useMutation({
    mutationFn: async ({
      title,
      userIds,
    }: {
      title: string;
      userIds: string[];
    }) => {
      const res = await fetch('http://localhost:3000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, userIds }),
      });

      if (!res.ok) throw new Error('Failed to create group');
      return res.json();
    },
  });
};

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });
};

export const listenForNewMessages = (
  chatId: string,
  callback: (message: any) => void
) => {
  socket.on('newMessage', (message) => {
    if (message.chatID === chatId) {
      callback(message);
    }
  });

  return () => {
    socket.off('newMessage');
  };
};
