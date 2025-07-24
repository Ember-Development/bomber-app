import { useUserContext } from '@/context/useUserContext';
import { Role } from '@/types';

/**
 * Ensures primary role is a normalized single string.
 */
function normalizeRole(input: Role | Role[] | undefined): Role {
  if (Array.isArray(input)) return input[0] || 'FAN';
  return input ?? 'FAN';
}

/**
 * Hook that returns the user with normalized role.
 */
export function useNormalizedUser() {
  const { user, refetch } = useUserContext();
  const primaryRole = normalizeRole(user?.primaryRole);

  return {
    user,
    refetch,
    primaryRole,
  };
}
