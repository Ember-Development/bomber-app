import io from 'socket.io-client';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const SOCKET_SERVER_URL = Constants.expoConfig?.extra?.SOCKET_SERVER_URL;

const socket = io(SOCKET_SERVER_URL);

export const fetchGroups = async ({
  take = 10,
  cursor,
}: {
  take?: number;
  cursor?: string;
}) => {
  let url = `${API_BASE_URL}/api/groups?take=${take}`;
  if (cursor) url += `&cursor=${cursor}`;

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

export const fetchUsersInGroup = async (chatId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/users/group/${chatId}`);
  if (!res.ok) throw new Error('Failed to fetch users in group');
  return res.json();
};

export const fetchMessages = async (chatId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/${chatId}`);
  return response.json();
};

export const addUsersToGroup = async ({
  groupId,
  userIds,
}: {
  groupId: string;
  userIds: string[];
}) => {
  const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) throw new Error('Failed to add users to group');
  return res.json();
};

export const socketInstance = socket;
