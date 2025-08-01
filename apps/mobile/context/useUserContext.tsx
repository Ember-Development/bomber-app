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
  const [userState, setUserState] = useState<UserFE | null>(null);

  useEffect(() => {
    if (data) setUserState(data);
  }, [data]);

  return (
    <UserContext.Provider
      value={{
        user: userState,
        isLoading,
        error: error ?? null,
        refetch,
        setUser: setUserState,
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
