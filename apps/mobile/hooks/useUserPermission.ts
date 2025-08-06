import { useUserContext } from '@/context/useUserContext';
import { Action, Role, roleToActions } from '@/types';

export const useUserPermissions = () => {
  const { user } = useUserContext();

  const roles: Role[] = user?.roles ?? [];

  const can = (action: Action): boolean => {
    for (const role of roles) {
      const actions = roleToActions[role] ?? [];
      if (actions.includes(action)) return true;
    }
    return false;
  };

  const canAll = (actionsToCheck: Action[]): boolean =>
    actionsToCheck.every((action) => can(action));

  const canAny = (actionsToCheck: Action[]): boolean =>
    actionsToCheck.some((action) => can(action));

  return {
    can,
    canAll,
    canAny,
  };
};
