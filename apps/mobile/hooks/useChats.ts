import { addUsersToGroup, useGroups } from '@/api/groups/groups';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchUsersInGroup } from '@/api/groups/groups';

export function useChats() {
  const { data: chats = [], isLoading, refetch } = useGroups();

  const [mutedGroups, setMutedGroups] = useState<{ [key: string]: boolean }>(
    {}
  );

  return {
    chats,
    mutedGroups,
    isLoading,
    refresh: refetch,
    loadChats: refetch,
    setMutedGroups,
  };
}

export const useUsersInGroup = (chatId: string) => {
  return useQuery({
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
