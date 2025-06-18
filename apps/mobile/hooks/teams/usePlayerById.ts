import { useQuery } from '@tanstack/react-query';
import { PlayerFE } from '@bomber-app/database';
import { getPlayerById } from '@/api/player/player';

export const usePlayerById = (id: string) => {
  return useQuery<PlayerFE>({
    queryKey: ['player', id],
    queryFn: () => getPlayerById(id),
    enabled: !!id,
  });
};
