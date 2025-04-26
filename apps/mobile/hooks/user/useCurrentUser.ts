import { useEffect, useState } from 'react';
import { api } from '@/api/api';
import { UserFE } from '@bomber-app/database';

export function useCurrentUser() {
  const [user, setUser] = useState<UserFE | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await api.get('/api/auth/login');
      setUser(data);
    };
    loadUser();
  }, []);

  return user;
}
