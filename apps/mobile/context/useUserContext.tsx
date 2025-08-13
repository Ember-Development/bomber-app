import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
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
  const [hasToken, setHasToken] = useState(false);
  const [userState, setUserState] = useState<UserFE | null>(null);

  // Bootstrap tokens
  useEffect(() => {
    (async () => {
      try {
        const [access, refresh] = await Promise.all([
          AsyncStorage.getItem('accessToken'),
          SecureStore.getItemAsync('refreshToken'),
        ]);
        const present = !!access || !!refresh;
        setHasToken(present);

        if (access) {
          api.defaults.headers.common.Authorization = `Bearer ${access}`;
        } else {
          delete api.defaults.headers.common.Authorization;
        }
      } catch {
        delete api.defaults.headers.common.Authorization;
        setHasToken(false);
      } finally {
        setTokenLoaded(true);
      }
    })();
  }, []);

  // Query for current user
  const {
    data,
    isLoading: queryLoading,
    error,
    refetch,
  } = useCurrentUser({
    enabled: tokenLoaded && hasToken,
  });

  // Hydrate user
  useEffect(() => {
    if (data) setUserState(data);
  }, [data]);

  // Handle /me auth errors
  useEffect(() => {
    if (!error) return;

    const status = (error as any)?.response?.status;
    if (status === 401 || status === 403) {
      console.warn('[UserProvider] /me auth error — clearing tokens');
      (async () => {
        try {
          await AsyncStorage.removeItem('accessToken');
        } catch {}
        try {
          await SecureStore.deleteItemAsync('refreshToken');
        } catch {}
        delete api.defaults.headers.common.Authorization;
        setHasToken(false);
        setUserState(null);
      })();
    } else {
      console.warn(
        '[UserProvider] /me failed (non-auth) — keeping session',
        error
      );
    }
  }, [error]);

  // Refresh user when app resumes
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && hasToken) {
        console.log('[UserProvider] App resumed — refreshing user');
        refetch(); // will use interceptor if access token is expired
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [hasToken, refetch]);

  const isLoading = !tokenLoaded ? true : hasToken ? queryLoading : false;

  const setUser = (u: UserFE | null) => {
    setUserState(u);
    if (!u) {
      delete api.defaults.headers.common.Authorization;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: userState,
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
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
}
