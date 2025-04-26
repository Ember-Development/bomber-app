import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/api/user';
import { PublicUserFE } from '@bomber-app/database';

export const useUsers = () => {
  return useQuery<PublicUserFE[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};
