import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserFE } from '@bomber-app/database';
import {
  api,
  bootstrapAuthFromStorage,
  tryRefresh,
  setAccess,
} from '@/api/api';

type AuthContextType = {
  user: UserFE | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<UserFE | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      bootstrapAuthFromStorage();

      if (!localStorage.getItem('access') && localStorage.getItem('refresh')) {
        try {
          await tryRefresh();
        } catch {
          /* ignore */
        }
      }

      await fetchMe();
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccess(data.access);
    localStorage.setItem('refresh', data.refresh);
    setUser(data.user);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    setAccess(null);
    localStorage.removeItem('refresh');
    setUser(null);
  };

  const isAdmin = !!user && (user.primaryRole === 'ADMIN' || !!user.admin);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
