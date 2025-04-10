import { addUsersToGroup, fetchGroups } from '@/api/groups/groups';
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchUsersInGroup } from '@/api/groups/groups';
import { ChatUser } from '../../types';

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
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      fetchGroups({ cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: string | any[]) => {
      if (lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
  });
};
