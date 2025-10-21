import { UserFE } from '@bomber-app/database';
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const t = await AsyncStorage.getItem('accessToken');
  console.log(
    '[CALLSITE updateUser] willSendAuth?',
    !!t,
    'url',
    `/api/users/${userId}`
  );
  const { data } = await api.put(`/api/users/${userId}`, userData);
  return data;
};

export const fetchLatestVersion = async () => {
  const t = await AsyncStorage.getItem('accessToken');
  console.log(
    '[CALLSITE fetchLatestVersion] willSendAuth?',
    !!t,
    'url',
    '/api/users/latest-version'
  );
  const { data } = await api.get('/api/users/latest-version');
  return data; // Now returns { version: "1.0.12", features: [...] }
};
