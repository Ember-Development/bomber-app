import { api } from '@/api/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createGroup = async ({
  title,
  userIds,
}: {
  title: string;
  userIds: string[];
}) => {
  const { data } = await api.post('/api/groups', {
    title,
    userIds,
  });
  return data;
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
