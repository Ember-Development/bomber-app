import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/api';
import { Action, Role } from '@/types';
import { UserFE } from '@bomber-app/database';

export function useCurrentUser() {
  return useQuery<UserFE, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      console.log('[useCurrentUser] calling GET /api/auth/me');
      const { data } = await api.get<UserFE>('/api/auth/me');
      console.log('[useCurrentUser] received:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
