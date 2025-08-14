// api.ts
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

const getAccess = () => AsyncStorage.getItem(ACCESS);
const setAccess = (t: string) => AsyncStorage.setItem(ACCESS, t);
const getRefresh = () => SecureStore.getItemAsync(REFRESH);
const setRefresh = (t: string) =>
  SecureStore.setItemAsync(REFRESH, t, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
const clearAll = async () => {
  await AsyncStorage.removeItem(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
};

export async function saveTokenPair(access?: string, refresh?: string) {
  if (access) await setAccess(access);
  if (refresh) await setRefresh(refresh);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---- single-flight refresh queue ----
let isRefreshing = false;
let waiters: Array<(t: string | null) => void> = [];
const notify = (t: string | null) => {
  waiters.forEach((fn) => fn(t));
  waiters = [];
};

async function refreshAccess(): Promise<string | null> {
  if (isRefreshing) return new Promise((res) => waiters.push(res));
  isRefreshing = true;
  try {
    const refresh = await getRefresh();
    if (!refresh) throw new Error('no-refresh');

    // IMPORTANT: backend expects { token }
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      token: refresh,
    });

    const newAccess: string | undefined = data?.access;
    const newRefresh: string | undefined = data?.refresh;
    if (!newAccess) throw new Error('no-access');

    await saveTokenPair(newAccess, newRefresh); // rotates if server returns refresh
    notify(newAccess);
    return newAccess;
  } catch {
    notify(null);
    await clearAll();
    return null;
  } finally {
    isRefreshing = false;
  }
}

// ---- attach token + proactive refresh ----
api.interceptors.request.use(async (config) => {
  let token = await getAccess();

  if (token) {
    try {
      const { exp } = jwtDecode<{ exp?: number }>(token);
      const now = Math.floor(Date.now() / 1000);
      if (exp && exp - now < 60) {
        const t = await refreshAccess();
        if (t) token = t;
      }
    } catch {}
  }

  if (token) {
    if (config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    } else {
      config.headers = { Authorization: `Bearer ${token}` } as any;
    }
  }
  return config;
});

// ---- retry once on 401 after refresh ----
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as any;
    if (!original || original._retry) throw error;

    if (error.response?.status === 401) {
      original._retry = true;
      const t = await refreshAccess();
      if (t) {
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${t}`,
        };
        return api(original);
      }
    }
    throw error;
  }
);
