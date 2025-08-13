import { useMutation, useQuery } from '@tanstack/react-query';
import { PlayerFE } from '@bomber-app/database';
import {
  addPlayerToTeam,
  deletePlayer,
  fetchPlayers,
  getPlayerById,
  updatePlayer,
} from '@/api/player/player';
import { useNormalizedUser } from '@/utils/user';

export const usePlayers = () => {
  return useQuery<PlayerFE[]>({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });
};

export const usePlayerById = (id: string) => {
  return useQuery<PlayerFE>({
    queryKey: ['player', id],
    queryFn: () => getPlayerById(id),
    enabled: !!id && id.length === 36,
  });
};

export const useUpdatePlayer = (
  id: string,
  options?: {
    onSuccess?: (data: PlayerFE) => void;
    onError?: (err: unknown) => void;
  }
) => {
  const { refetch } = useNormalizedUser();

  return useMutation({
    mutationFn: (data: Partial<PlayerFE>) => updatePlayer(id, data),
    onSuccess: (data) => {
      refetch();
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useDeletePlayer = (options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) => {
  const { refetch } = useNormalizedUser();

  return useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      refetch();
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useAddPlayerToTeam = (options?: {
  onSuccess?: (data: PlayerFE) => void;
  onError?: (err: unknown) => void;
}) => {
  return useMutation({
    mutationFn: ({
      playerId,
      teamCode,
    }: {
      playerId: string;
      teamCode: string;
    }) => addPlayerToTeam({ playerId, teamCode }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
