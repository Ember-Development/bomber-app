import { useQuery } from '@tanstack/react-query';
import { UserFE } from '@bomber-app/database';
import { fetchUsers } from '@/api/user';

export const useUsers = () => {
  return useQuery<UserFE[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};
