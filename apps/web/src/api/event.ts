import { api } from './api';
import type { EventFE } from '@bomber-app/database';

export const fetchEvents = async (): Promise<EventFE[]> => {
  const res = await api.get<EventFE[]>('/events');
  return res.data;
};
