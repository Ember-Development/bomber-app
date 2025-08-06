import { Role, Action } from '../auth/permissions';

export interface AuthenticatedUser {
  id: string;
  roles: Role[];
  actions: Action[];
  primaryRole: Role;
}
