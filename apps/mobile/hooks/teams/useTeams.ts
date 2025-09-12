import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addTrophy,
  deleteTrophy,
  fetchTeamByCode,
  fetchTeams,
  getTeamById,
  updateTrophy,
} from '../../api/teams/teams';
import { TeamFE, Trophy } from '@bomber-app/database';
import { useNormalizedUser } from '@/utils/user';
import { getUnassignedPlayers } from '@/api/player/player';

export const useTeams = () => {
  return useQuery<TeamFE[]>({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });
};

export const useUnassignedPlayers = (filters?: {
  search?: string;
  ageGroup?: string;
  pageSize?: number;
}) => {
  const { search, ageGroup, pageSize = 20 } = filters ?? {};
  return useInfiniteQuery({
    queryKey: ['players', 'unassigned', { search, ageGroup, pageSize }],
    queryFn: ({ pageParam }) =>
      getUnassignedPlayers({
        cursor: pageParam,
        limit: pageSize,
        search,
        ageGroup,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};

export const useTeamById = (id: string) => {
  return useQuery<TeamFE>({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id),
  });
};

export const useTeamByCode = (code: string) => {
  return useQuery<TeamFE>({
    queryKey: ['teamCode', code],
    queryFn: () => fetchTeamByCode(code),
    enabled: !!code && code.length === 5,
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
