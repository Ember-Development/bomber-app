// src/api/events.ts
import { api } from './api';
import type { EventFE } from '@bomber-app/database';
import type { AttendanceStatus } from '@bomber-app/database/generated/client';

export interface NewEventAttendance {
  userID: string;
  status: 'PENDING' | 'ATTENDING' | 'MAYBE' | 'DECLINED';
}

export interface CreateEventPayload {
  event: {
    eventType: 'GLOBAL' | 'TOURNAMENT' | 'PRACTICE';
    start: string; // ISO
    end: string; // ISO
    title?: string | null;
    body?: string | null; // details: facility/address/notes
    location?: string | null; // "City, ST" or freeform
  };
  attendees: NewEventAttendance[]; // empty array for GLOBAL
  tournamentID?: string | null;
}

export interface UpdateEventPayload {
  eventType?: 'GLOBAL' | 'TOURNAMENT' | 'PRACTICE';
  start?: string;
  end?: string;
  title?: string | null;
  body?: string | null;
  location?: string | null;
  tournamentID?: string | null; // if you support editing this
}

export type EventDetailDTO = EventFE;

export const fetchEvents = async (): Promise<EventFE[]> => {
  const res = await api.get<EventFE[]>('/events');
  return res.data;
};

export const fetchEventById = async (id: string): Promise<EventDetailDTO> => {
  const res = await api.get<EventDetailDTO>(`/events/${id}`);
  return res.data;
};

export const fetchEventAttendees = async (id: string) => {
  const res = await api.get(`/events/${id}/attendees`);
  return res.data as Array<{
    status: AttendanceStatus;
    user: { id: string; fname?: string | null; lname?: string | null };
  }>;
};

export const createEvent = async (
  payload: CreateEventPayload
): Promise<EventFE> => {
  // backend returns { event: ... }, normalize to event
  const res = await api.post(`/events`, payload);
  return (res.data?.event ?? res.data) as EventFE;
};

export const updateEvent = async (
  id: string,
  dto: UpdateEventPayload
): Promise<EventFE> => {
  const res = await api.put(`/events/${id}`, dto);
  return res.data as EventFE;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  await api.delete(`/events/${id}`);
  return true;
};

// attendees (admin editing)
export const addEventAttendees = async (
  id: string,
  userIds: string[],
  status: AttendanceStatus = 'PENDING'
) => {
  const res = await api.post(`/events/${id}/attendees`, {
    userIds,
    status,
  });
  return res.data;
};

export const removeEventAttendee = async (id: string, userId: string) => {
  await api.delete(`/events/${id}/attendees/${userId}`);
  return true;
};
