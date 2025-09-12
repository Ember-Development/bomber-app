import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUsersToGroup } from '@/api/groups/groups';

export const useAddUsersToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUsersToGroup,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });

      if (variables?.groupId) {
        queryClient.invalidateQueries({
          queryKey: ['users-in-group', variables.groupId],
        });
      }
    },
    onError: (err: any) => {
      console.error('Failed to add users to group', err?.response?.data || err);
    },
  });
};
