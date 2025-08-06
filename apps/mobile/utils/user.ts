import { useUserContext } from '@/context/useUserContext';
import { Role } from '@/types';

function normalizeRole(input: Role | Role[] | undefined): Role {
  if (Array.isArray(input)) return input[0] || 'FAN';
  return input ?? 'FAN';
}

export function useNormalizedUser() {
  const { user, refetch } = useUserContext();
  const primaryRole = normalizeRole(user?.primaryRole);

  return {
    user,
    refetch,
    primaryRole,
  };
}
