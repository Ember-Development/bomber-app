import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/api';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  deepLink?: string | null;
  sentAt: string; // ISO
}

export function useNotificationsFeed(unreadOnly = true) {
  return useQuery({
    queryKey: ['notifications', 'feed', { unreadOnly }],
    queryFn: async () => {
      const { data } = await api.get<{ items: NotificationItem[] }>(
        `/api/notifications/feed?unreadOnly=${unreadOnly ? 'true' : 'false'}`
      );
      return (data.items ?? []).sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });
}
