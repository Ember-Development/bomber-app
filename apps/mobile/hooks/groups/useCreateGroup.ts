import { api } from '@/api/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateGroupPayload } from '../../types';

const createGroup = async ({ title, userIds }: CreateGroupPayload) => {
  const { data } = await api.post('/api/groups', { title, userIds });
  return data;
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (err: any) => {
      console.error('Failed to create group', err?.response?.data || err);
    },
  });
};
