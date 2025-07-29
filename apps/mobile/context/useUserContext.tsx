import React, { createContext, ReactNode, useContext } from 'react';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import { UserFE } from '@bomber-app/database';

interface UserContextValue {
  user: UserFE | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, error, refetch } = useCurrentUser();

  return (
    <UserContext.Provider
      value={{
        user: data ?? null,
        isLoading,
        error: error ?? null,
        refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return ctx;
}
