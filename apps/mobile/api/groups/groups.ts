import { useQuery, useMutation } from '@tanstack/react-query';
import io from 'socket.io-client';
import Constants from 'expo-constants';

const API_BASE = 'http://192.168.1.76:3000';
const socket = io('http://localhost:3000');

const fetchMessages = async (chatId: string) => {
  const response = await fetch(`http://localhost:3000/api/messages/${chatId}`);
  return response.json();
};

export const fetchUsersInGroup = async (chatId: string) => {
  const res = await fetch(`${API_BASE}/api/users/group/${chatId}`);
  if (!res.ok) throw new Error('Failed to fetch users in group');
  return res.json();
};

export const useGroupMessages = (chatId: string) => {
  return useQuery({
    queryKey: ['groupMessages', chatId],
    queryFn: () => fetchMessages(chatId),
    staleTime: 1000 * 30,
  });
};

export const addUsersToGroup = async ({
  groupId,
  userIds,
}: {
  groupId: string;
  userIds: string[];
}) => {
  const res = await fetch(`${API_BASE}/api/groups/${groupId}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  });

  if (!res.ok) {
    throw new Error('Failed to add users to group');
  }

  return res.json();
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
      const res = await fetch(`${API_BASE}/api/groups`, {
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

export const fetchGroups = async ({
  take = 10,
  cursor,
}: {
  take?: number;
  cursor?: string;
}) => {
  let url = `${API_BASE}/api/groups?take=${take}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }

  const response = await fetch(url);
  const raw = await response.json();

  return raw.map((chat: any) => ({
    id: chat.id,
    title: chat.title,
    users: chat.users.map((u: any) => ({
      userID: u.userID,
      chatID: u.chatID,
      joinedAt: new Date(u.joinedAt),
    })),
    messages: chat.messages.map((m: any) => ({
      id: m.id,
      userID: m.userID,
      chatID: m.chatID,
      text: m.text,
      createdAt: new Date(m.createdAt),
    })),
  }));
};

export const listenForNewMessages = (
  chatId: string,
  callback: (message: any) => void
) => {
  socket.on('newMessage', (message: { chatID: string }) => {
    if (message.chatID === chatId) {
      callback(message);
    }
  });

  return () => {
    socket.off('newMessage');
  };
};
