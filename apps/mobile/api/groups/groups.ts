import io from 'socket.io-client';
import Constants from 'expo-constants';
import { api } from '../api';
import { ChatFE } from '@bomber-app/database';

type UserInChat = ChatFE['users'][number];
type MessageInChat = ChatFE['messages'][number];

const SOCKET_SERVER_URL = Constants.expoConfig?.extra?.SOCKET_SERVER_URL;

const socket = io(SOCKET_SERVER_URL);

export const fetchGroups = async ({
  take = 10,
  cursor,
}: {
  take?: number;
  cursor?: { lastMessageAt: string; id: string };
}) => {
  const { data } = await api.get('/api/groups', {
    params: {
      take,
      cursor: cursor?.id,
    },
  });

  return data.map((chat: ChatFE) => ({
    id: chat.id,
    title: chat.title,
    lastMessageAt: new Date(chat.lastMessageAt),
    users: chat.users.map((u: UserInChat) => ({
      userID: u.userID,
      chatID: u.chatID,
      joinedAt: new Date(u.joinedAt),
    })),
    messages: chat.messages.map((m: MessageInChat) => ({
      id: m.id,
      userID: m.userID,
      chatID: m.chatID,
      text: m.text,
      createdAt: new Date(m.createdAt),
    })),
  }));
};

export const fetchUsersInGroup = async (chatId: string) => {
  const { data } = await api.get(`/api/users/group/${chatId}`);
  return data;
};

export const fetchMessages = async (chatId: string) => {
  const { data } = await api.get(`/api/messages/${chatId}`);
  return data;
};

export const addUsersToGroup = async ({
  groupId,
  userIds,
}: {
  groupId: string;
  userIds: string[];
}) => {
  const { data } = await api.post(`/api/groups/${groupId}/users`, {
    userIds,
  });
  return data;
};

export const socketInstance = socket;
