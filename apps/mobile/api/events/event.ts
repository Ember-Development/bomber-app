import { api } from '@/api/api';

export async function rsvpEvent(
  eventId: string,
  status: 'ATTENDING' | 'MAYBE' | 'DECLINED'
) {
  const r = await api.post(`/api/events/${eventId}/rsvp`, { status });
  return r.data;
}
export async function unRsvpEvent(eventId: string) {
  const r = await api.delete(`/api/events/${eventId}/rsvp`);
  return r.data;
}
