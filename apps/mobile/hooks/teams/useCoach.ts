import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CoachFE } from '@bomber-app/database';
import { deleteCoach, getCoachById, updateCoach } from '@/api/teams/coach';
import { useNormalizedUser } from '@/utils/user';

interface Params {
  id: string;
  data: {
    fname: string;
    lname: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
  };
}

export const useCoachById = (id: string) => {
  return useQuery<CoachFE>({
    queryKey: ['coach', id],
    queryFn: () => getCoachById(id),
    enabled: !!id,
  });
};

export const useUpdateCoach = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { refetch } = useNormalizedUser();

  return useMutation({
    mutationFn: ({ id, data }: Params) => updateCoach(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['coach', id] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      refetch();
      onSuccess?.();
    },
  });
};

export const useDeleteCoach = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const { refetch } = useNormalizedUser();

  return useMutation<void, unknown, string>({
    mutationFn: (id: string) => deleteCoach(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['coach', id] });
      queryClient.invalidateQueries({ queryKey: ['coaches'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      refetch();
      options?.onSuccess?.();
    },
    onError: (err) => console.error('[HOOK] deleteCoach failed:', err),
    ...options,
  });
};
