import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addTrophy,
  deleteTrophy,
  fetchTeams,
  getTeamById,
  updateTrophy,
} from '../../api/teams/teams';
import { TeamFE, Trophy } from '@bomber-app/database';
import { useNormalizedUser } from '@/utils/user';

export const useTeams = () => {
  return useQuery<TeamFE[]>({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });
};

export const useTeamById = (id: string) => {
  return useQuery<TeamFE>({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id),
  });
};

export const useAddTrophy = (teamId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; imageURL: string }) =>
      addTrophy({ teamId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      onSuccess?.();
    },
  });
};

export const useUpdateTrophy = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { refetch } = useNormalizedUser();

  return useMutation({
    mutationFn: ({
      teamId,
      trophyId,
      data,
    }: {
      teamId: string;
      trophyId: string;
      data: {
        title?: string;
        imageURL?: string;
      };
    }) => updateTrophy(teamId, trophyId, data),
    onSuccess: () => {
      refetch();
      onSuccess?.();
    },
  });
};

export const useDeleteTrophy = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { refetch } = useNormalizedUser();

  return useMutation({
    mutationFn: ({ teamId, trophyId }: { teamId: string; trophyId: string }) =>
      deleteTrophy({ teamId, trophyId }),
    onSuccess: () => {
      refetch();
      onSuccess?.();
    },
  });
};
