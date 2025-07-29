import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import { UserFE } from '@bomber-app/database';

interface UserContextValue {
  user: UserFE | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  setUser: (user: UserFE | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, error, refetch } = useCurrentUser();
  const [userState, setUser] = useState<UserFE | null>(data ?? null);

  useEffect(() => {
    if (data) setUser(data);
  }, [data]);

  return (
    <UserContext.Provider
      value={{
        user: data ?? null,
        isLoading,
        error: error ?? null,
        refetch,
        setUser,
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
