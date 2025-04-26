import { addUsersToGroup, fetchGroups } from '@/api/groups/groups';
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchUsersInGroup } from '@/api/groups/groups';
import { ChatUser } from '@bomber-app/database';

export const useUsersInGroup = (chatId: string) => {
  return useQuery<ChatUser[]>({
    queryKey: ['users-in-group', chatId],
    queryFn: () => fetchUsersInGroup(chatId),
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddUsersToGroup = () => {
  return useMutation({
    mutationFn: addUsersToGroup,
  });
};

export const usePaginatedChats = () => {
  return useInfiniteQuery({
    queryKey: ['groups'],
    queryFn: ({
      pageParam,
    }: {
      pageParam?: { lastMessageAt: string; id: string };
    }) => fetchGroups({ cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any[]) => {
      if (lastPage.length === 0) return undefined;
      const last = lastPage[lastPage.length - 1];
      return {
        lastMessageAt: last.lastMessageAt.toISOString(),
        id: last.id,
      };
    },
  });
};
