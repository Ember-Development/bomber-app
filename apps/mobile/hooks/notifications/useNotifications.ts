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

export function useNotificationsFeed(unreadOnly = true, enabled = true) {
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
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: enabled ? 15000 : false,
    refetchIntervalInBackground: enabled,
  });
}
