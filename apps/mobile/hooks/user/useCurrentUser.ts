import { api } from '@/api/api';
import { Action, Role } from '@/types';
import { UserFE } from '@bomber-app/database';

export interface CurrentUser extends UserFE {
  roles: Role[];
  actions: Action[];
}

export const useCurrentUser = async (): Promise<CurrentUser> => {
  const { data } = await api.get<CurrentUser>('/api/auth/login');
  return data;
};
