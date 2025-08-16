import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CoachFE, TeamFE } from '@bomber-app/database';
import {
  deleteCoach,
  getCoachById,
  removeCoachFromTeam,
  updateCoach,
} from '@/api/teams/coach';
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

type Vars = { coachId: string; teamId: string };

export const useRemoveCoachFromTeam = (options?: {
  onSuccess?: (team: TeamFE) => void;
  onError?: (err: unknown) => void;
  teamId?: string;
}) => {
  const qc = useQueryClient();
  const { refetch: refetchMe } = useNormalizedUser();

  return useMutation({
    mutationFn: ({ coachId, teamId }: Vars) =>
      removeCoachFromTeam(coachId, teamId),
    onSuccess: (team) => {
      // keep cache fresh
      qc.invalidateQueries({ queryKey: ['teams'] });
      qc.invalidateQueries({ queryKey: ['team', team.id] });
      if (options?.teamId) {
        qc.setQueryData(['team', options.teamId], team);
      }
      refetchMe();
      options?.onSuccess?.(team);
    },
    onError: options?.onError,
  });
};
