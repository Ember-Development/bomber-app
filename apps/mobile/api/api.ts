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
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }, //TODO: figure out why caching existed, needs this header to get data locally for events
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
    const raw = await getRefresh();
    const refresh = raw?.trim();
    if (!refresh) throw new Error('no-refresh');

    // Backend expects { token }
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

// ---- proactive refresh helper with skew ----
const SKEW = 120; // seconds
async function getPossiblyRefreshedAccess(): Promise<string | null> {
  let token = await getAccess();
  if (!token) return null;

  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    const now = Math.floor(Date.now() / 1000);
    if (exp && exp - now < SKEW) {
      const t = await refreshAccess();
      if (t) token = t;
    }
  } catch {
    // If decode fails, try to refresh once
    const t = await refreshAccess();
    if (t) token = t;
  }
  return token;
}

// ---- request interceptor #1: attach Authorization + mark __hadAuth ----
api.interceptors.request.use(async (config) => {
  const token = await getPossiblyRefreshedAccess();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    (config as any).__hadAuth = true; // mark that auth was set
  } else {
    (config as any).__hadAuth = false;
  }

  console.log(
    '[REQ]',
    config.method,
    config.url,
    'Auth?',
    !!(config.headers as any)?.Authorization
  );
  return config;
});

// ---- request interceptor #2 (finalizer): re-assert Authorization if clobbered ----
api.interceptors.request.use(async (config) => {
  const hadAuthAlready = !!(config.headers as any)?.Authorization;
  if (!hadAuthAlready) {
    // Callsite likely overwrote headers; re-assert using current access token
    const token = await getAccess(); // no second refresh here
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
      if ((config as any).__hadAuth === false) {
        (config as any).__hadAuth = true;
      }
    }
  }
  return config;
});

// ---- response interceptor: retry once on 401 after refresh ----
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as any;
    if (!original || original._retry) throw error;

    // Don't try to refresh the refresh call itself
    const isRefreshCall =
      typeof original?.url === 'string' &&
      original.url.includes('/api/auth/refresh');
    if (isRefreshCall) throw error;

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
