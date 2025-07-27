import { api } from '@/api/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateGroupPayload } from '../../types';
import { ChatFE } from '@bomber-app/database';

const createGroup = async (payload: CreateGroupPayload) => {
  const { data } = await api.post('/api/groups', payload);
  return data;
};

export const useCreateGroup = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: (newGroup: ChatFE) => {
      if (!userId) return;
      queryClient.setQueryData(
        ['user-chats', userId],
        (old: ChatFE[] | undefined) => {
          if (!old) return [newGroup];
          return [newGroup, ...old];
        }
      );
    },
    onError: (err: any) => {
      console.error('Failed to create group', err?.response?.data || err);
    },
  });
};
