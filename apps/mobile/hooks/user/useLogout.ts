import { useRouter } from 'expo-router';
import { useUserContext } from '@/context/useUserContext';
import { api } from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const router = useRouter();
  const { setUser } = useUserContext();
  const qc = useQueryClient();

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('[LOGOUT] backend logout failed', err);
    }

    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    qc.clear();

    setUser(null);
    router.replace('/login');
  };

  return logout;
}
