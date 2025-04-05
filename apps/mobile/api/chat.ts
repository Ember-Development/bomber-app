import { ChatFE, MessageFE, UserFE, UserRole } from '@bomber-app/database';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

const API_BASE = 'http://192.168.1.76:3000';
// Fetch chat messages
const fetchChatMessages = async ({
  chatId,
  pageParam,
}: {
  chatId: string;
  pageParam?: string;
}) => {
  const cursorParam = pageParam ? `&cursor=${pageParam}` : '';
  const res = await fetch(
    `${API_BASE}/api/messages/${chatId}?limit=20${cursorParam}`
  );
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
};

// Fetch chat details
const fetchChatDetails = async (chatId: string) => {
  const res = await fetch(`${API_BASE}/api/groups`);
  if (!res.ok) throw new Error('Failed to fetch group');
  const allGroups = await res.json();
  return allGroups.find((group: any) => group.id === chatId) ?? null;
};

// React Query Hooks
export const useChatMessages = (chatId: string) => {
  return useInfiniteQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      fetchChatMessages({ chatId, pageParam }),
    getNextPageParam: (lastPage: string | any[]) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    initialPageParam: undefined,
    enabled: !!chatId,
  });
};

export const useChatDetails = (chatId: string) => {
  return useQuery<ChatFE | null>({
    queryKey: ['chatDetails', chatId],
    queryFn: () => fetchChatDetails(chatId),
  });
};
