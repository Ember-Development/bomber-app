import { api } from './api';

export interface EventFE {
  id: string;
  eventType: string;
  start: Date;
  end: Date;
  title?: string | null;
  body?: string | null;
  location?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tournamentID?: string | null;
}

export const fetchEvents = async (): Promise<EventFE[]> => {
  try {
    const response = await api.get<EventFE[]>('/events');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
};

// Get the most upcoming global event
export const getUpcomingEvent = async (): Promise<EventFE | null> => {
  try {
    const events = await fetchEvents();
    const now = new Date();

    // Filter for GLOBAL events that start in the future, sorted by start date
    const upcoming = events
      .filter((e) => e.eventType === 'GLOBAL' && new Date(e.start) > now)
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

    return upcoming[0] || null;
  } catch (error) {
    console.error('Failed to fetch upcoming event:', error);
    return null;
  }
};
