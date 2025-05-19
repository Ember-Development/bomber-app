import { UserFE } from '@bomber-app/database';
import { api } from './api';

export const fetchUsers = async () => {
  const { data } = await api.get('/api/users');
  return data;
};

export const fetchUserEvents = async (userId: string) => {
  const { data } = await api.get(`/api/users/${userId}/events`);
  return data;
};

export const fetchUserChats = async (userId: string) => {
  const { data } = await api.get(`/api/users/${userId}/chats`);
  return data;
};

export const updateUser = async (userId: string, userData: Partial<UserFE>) => {
  const { data } = await api.put(`/api/users/${userId}`, userData);
  return data;
};
