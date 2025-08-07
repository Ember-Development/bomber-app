// context/useUserContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/api/api';
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
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [userState, setUserState] = useState<UserFE | null>(null);

  // 1️⃣ Bootstrap token once at mount
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setTokenLoaded(true);
    })();
  }, []);

  // 2️⃣ Only run /me query after tokenLoaded is true
  const {
    data,
    isLoading: queryLoading,
    error,
    refetch,
  } = useCurrentUser({ enabled: tokenLoaded });

  // 3️⃣ When data arrives, hydrate userState
  useEffect(() => {
    if (data) setUserState(data);
  }, [data]);

  // 4️⃣ Keep loading true until token is loaded AND query is running
  const isLoading = !tokenLoaded || queryLoading;

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
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
}
