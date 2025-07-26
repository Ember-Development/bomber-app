import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUsersToGroup } from '@/api/groups/groups';

export const useAddUsersToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUsersToGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (err: any) => {
      console.error('Failed to add users to group', err?.response?.data || err);
    },
  });
};
