import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/api';
import { UserFE } from '@bomber-app/database';

const fetchCurrentUser = async (): Promise<UserFE> => {
  const { data } = await api.get('/api/auth/login');
  return data;
};

export function useCurrentUser() {
  return useQuery<UserFE>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });
}
