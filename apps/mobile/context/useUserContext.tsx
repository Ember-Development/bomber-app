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
  const [hasToken, setHasToken] = useState(false);
  const [userState, setUserState] = useState<UserFE | null>(null);

  // 1) Bootstrap token once at mount and set/clear Authorization header defensively
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const present = !!token;
        setHasToken(present);

        if (present && token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          // important: clear any stale header from a previous session
          delete api.defaults.headers.common.Authorization;
        }
      } catch (e) {
        // If anything goes wrong, ensure we don't keep a bad header around
        delete api.defaults.headers.common.Authorization;
        setHasToken(false);
      } finally {
        setTokenLoaded(true);
      }
    })();
  }, []);

  // 🔎 Debug: see auth bootstrap state changes on both platforms
  useEffect(() => {
    console.log('[UserProvider]', {
      tokenLoaded,
      hasToken,
      userLoaded: !!userState,
    });
  }, [tokenLoaded, hasToken, userState]);

  // 2) Only run /me query after token is known AND present
  const {
    data,
    isLoading: queryLoading,
    error,
    refetch,
  } = useCurrentUser({
    enabled: tokenLoaded && hasToken,
  });

  // 3) Hydrate user when data arrives
  useEffect(() => {
    if (data) setUserState(data);
  }, [data]);

  // 4) If /me fails (e.g., 401), clear tokens + header and force logged-out state
  useEffect(() => {
    if (!error) return;
    console.warn('[UserProvider] /me failed — clearing auth', error);

    (async () => {
      try {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      } catch {}
      delete api.defaults.headers.common.Authorization;
      setHasToken(false);
      setUserState(null);
    })();
  }, [error]);

  // 5) Loading state logic:
  // - If token hasn't been checked yet => loading
  // - If token exists => reflect query loading
  // - If no token => not loading (show public routes)
  const isLoading = !tokenLoaded ? true : hasToken ? queryLoading : false;

  // 6) Expose a safe setter that clears header when logging out
  const setUser = (u: UserFE | null) => {
    setUserState(u);
    if (!u) {
      // clear header on logout or explicit unset
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
