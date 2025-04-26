import { ChatFE, MessageFE } from '@bomber-app/database';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { QueryFunctionContext } from '@tanstack/react-query';

// Fetch chat messages
const fetchChatMessages = async ({
  chatId,
  pageParam,
}: {
  chatId: string;
  pageParam?: string;
}) => {
  const { data } = await api.get(`/api/messages/${chatId}`, {
    params: {
      limit: 20,
      cursor: pageParam,
    },
  });
  return data;
};

// Fetch chat details
const fetchChatDetails = async (chatId: string) => {
  const { data: allGroups } = await api.get('/api/groups');
  return allGroups.find((group: ChatFE) => group.id === chatId) ?? null;
};

// retry chat message
export const retryMessage = async ({
  messageId,
  chatId,
  userId,
}: {
  messageId: string;
  chatId: string;
  userId: string;
}) => {
  const { data } = await api.post(`/api/messages/${messageId}/retry`, {
    messageId,
    chatId,
    userId,
  });
  return data;
};

// React Query Hooks
export const useChatMessages = (chatId: string) => {
  return useInfiniteQuery<MessageFE[], unknown, MessageFE[], [string, string]>({
    queryKey: ['chatMessages', chatId],
    queryFn: async (
      ctx: QueryFunctionContext<[string, string]>
    ): Promise<MessageFE[]> => {
      const pageParam = ctx.pageParam as string | undefined;
      return await fetchChatMessages({ chatId, pageParam });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
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
