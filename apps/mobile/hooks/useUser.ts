import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/api/user';
import { UserFE } from '@/types';

export const useUsers = () => {
  return useQuery<UserFE[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};
