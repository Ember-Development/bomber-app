import { api } from '@/api/api';
import { UserFE } from '@bomber-app/database';

export const useCurrentUser = async (): Promise<UserFE> => {
  const { data } = await api.get('/api/auth/login');
  return data;
};
