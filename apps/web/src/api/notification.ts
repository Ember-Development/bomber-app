// src/api/notifications.ts
import { api } from './api';

export type TargetPlatform = 'both' | 'ios' | 'android';

export type Audience = {
  all?: boolean;
  roles?: string[];
  regions?: string[];
  teamIds?: string[];
  userIds?: string[];
};

export interface NotificationFE {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  deepLink?: string | null;
  platform: TargetPlatform;
  status: 'draft' | 'queued' | 'sent';
  scheduledAt?: string | null; // ISO
  sentAt?: string | null; // ISO
  data?: Record<string, string> | null;
  audience: Audience;
  createdAt?: string;
}

export interface CreateNotificationDTO {
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  platform?: TargetPlatform; // default 'both' server-side
  audience: Audience;
  scheduledAt?: string; // ISO
  data?: Record<string, string>;
}

export interface FeedItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  deepLink?: string | null;
  sentAt: string; // ISO
}

export const createNotification = async (
  payload: CreateNotificationDTO
): Promise<NotificationFE | null> => {
  try {
    const { data } = await api.post<NotificationFE>('/notifications', payload);
    return data;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

export const sendNotificationNow = async (id: string): Promise<boolean> => {
  try {
    await api.post(`/notifications/${id}/send`);
    return true;
  } catch (err) {
    console.error(`Failed to send notification ${id}:`, err);
    return false;
  }
};

export const updateNotification = async (
  id: string,
  payload: Partial<CreateNotificationDTO>
): Promise<NotificationFE | null> => {
  try {
    const { data } = await api.put<NotificationFE>(
      `/notifications/${id}`,
      payload
    );
    return data;
  } catch (err) {
    console.error(`Failed to update notification ${id}:`, err);
    return null;
  }
};

export const fetchDrafts = async (): Promise<NotificationFE[]> => {
  try {
    const { data } = await api.get<{ drafts: NotificationFE[] }>(
      '/notifications/drafts'
    );
    return data?.drafts ?? [];
  } catch (err) {
    console.error('Failed to fetch drafts:', err);
    return [];
  }
};

export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/notifications/${id}`);
    return true;
  } catch (err) {
    console.error(`Failed to delete notification ${id}:`, err);
    return false;
  }
};

export const fetchNotificationFeed = async (): Promise<FeedItem[]> => {
  try {
    const { data } = await api.get<{ items: FeedItem[] }>(
      '/notifications/feed'
    );
    const items = data?.items ?? [];
    // newest first just in case
    return items.sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  } catch (err) {
    console.error('Failed to fetch notifications feed:', err);
    return [];
  }
};

/**
 * Mark a given notification as "opened" for the current user.
 */
export const markNotificationOpened = async (
  notificationId: string
): Promise<boolean> => {
  try {
    await api.post('/notifications/receipt/open', { notificationId });
    return true;
  } catch (err) {
    console.error(
      `Failed to mark notification ${notificationId} as opened:`,
      err
    );
    return false;
  }
};
