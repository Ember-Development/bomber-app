// hooks/auth/useLogout.ts
import { useRouter } from 'expo-router';
import { useUserContext } from '@/context/useUserContext';
import { api } from '@/api/api'; // your axios instance
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useLogout() {
  const router = useRouter();
  const { setUser } = useUserContext();

  const logout = async () => {
    try {
      await api.post('/api/auth/logout'); // optional; your backend ignores it
    } catch (err) {
      console.warn('[LOGOUT] backend logout failed', err);
    }

    await AsyncStorage.removeItem('token');
    setUser(null);
    router.replace('/login'); // force nav to login screen
  };

  return logout;
}
