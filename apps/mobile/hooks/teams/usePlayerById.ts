import { useMutation, useQuery } from '@tanstack/react-query';
import { PlayerFE } from '@bomber-app/database';
import { deletePlayer, getPlayerById, updatePlayer } from '@/api/player/player';

export const usePlayerById = (id: string) => {
  return useQuery<PlayerFE>({
    queryKey: ['player', id],
    queryFn: () => getPlayerById(id),
    enabled: !!id,
  });
};

export const useUpdatePlayer = (
  id: string,
  options?: {
    onSuccess?: (data: PlayerFE) => void;
    onError?: (err: unknown) => void;
  }
) =>
  useMutation({
    mutationFn: (data: Partial<PlayerFE>) => updatePlayer(id, data),
    ...options,
  });

export const useDeletePlayer = (
  id: string,
  options?: {
    onSuccess?: () => void;
    onError?: (err: unknown) => void;
  }
) =>
  useMutation({
    mutationFn: () => deletePlayer(id),
    ...options,
  });
