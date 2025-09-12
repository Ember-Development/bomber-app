import { getAlumniPlayersPaginated } from '@/api/player/player';
import { PlayerFE } from '@bomber-app/database';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useAlumniPlayersPaginated = () => {
  return useInfiniteQuery<PlayerFE[], Error>({
    queryKey: ['players', 'alumni'],
    queryFn: async ({ pageParam }) =>
      getAlumniPlayersPaginated({
        cursor: pageParam as string | undefined,
        limit: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.length === 20 ? lastPage[lastPage.length - 1].id : undefined,
    initialPageParam: undefined,
  });
};
