import { api } from '@/api/Client';
import { useQuery } from '@tanstack/react-query';

export type PublicUserFE = {
  id: number | string;
  fname: string;
  lname: string;
  primaryRole: 'ADMIN' | 'COACH' | 'REGIONAL_COACH' | 'PLAYER' | 'FAN';
};

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<PublicUserFE[]> => {
      const { data } = await api.get('/users/web');
      return data;
    },
  });
