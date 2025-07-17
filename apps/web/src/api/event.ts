// src/api/events.ts
import { api } from './api';
import type { EventFE } from '@bomber-app/database';

export interface CreateEventDTO {
  eventType: 'GLOBAL' | 'TOURNAMENT' | 'PRACTICE';
  start: string;
  end: string;
  tournamentID?: string;
}

export interface UpdateEventDTO extends CreateEventDTO {}

export const fetchEvents = async (): Promise<EventFE[]> => {
  const res = await api.get<EventFE[]>('/events');
  return res.data;
};

export const fetchEventById = async (id: string): Promise<EventFE> => {
  const res = await api.get<EventFE>(`/events/${id}`);
  return res.data;
};

export const createEvent = async (dto: CreateEventDTO): Promise<EventFE> => {
  const res = await api.post<EventFE>('/events', dto);
  return res.data;
};

export const updateEvent = async (
  id: string,
  dto: UpdateEventDTO
): Promise<EventFE> => {
  const res = await api.put<EventFE>(`/events/${id}`, dto);
  return res.data;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  await api.delete(`/events/${id}`);
  return true;
};
