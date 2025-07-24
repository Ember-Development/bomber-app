import { api } from './api';
import { MessageFE } from '@bomber-app/database';

export const fetchMessages = async (): Promise<MessageFE[]> => {
  try {
    const res = await api.get<MessageFE[]>('/messages');
    return res.data;
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    return [];
  }
};
