import { addUsersToGroup, fetchGroups } from '@/api/groups/groups';
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchUsersInGroup } from '@/api/groups/groups';
import { ChatUser } from '../types';

// export function useChats() {
//   const { data: chats = [], isLoading, refetch } = useGroups();

//   const [mutedGroups, setMutedGroups] = useState<{ [key: string]: boolean }>(
//     {}
//   );

//   return {
//     chats,
//     mutedGroups,
//     isLoading,
//     refresh: refetch,
//     loadChats: refetch,
//     setMutedGroups,
//   };
// }

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
