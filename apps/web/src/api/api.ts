import axios from 'axios';

const VITE_API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = localStorage.getItem('access');
if (accessToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

// Separate client to avoid interceptor recursion during refresh
const refreshClient = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshing = false;
let waiters: Array<() => void> = [];

function setAccess(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('access', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('access');
    delete api.defaults.headers.common['Authorization'];
  }
}

export async function tryRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) return null;

  // Your /auth/refresh should accept { refresh } and return { access } (or accessToken)
  const { data } = await refreshClient.post('/auth/refresh', { refresh });
  const newAccess = data?.access || data?.accessToken || null;
  if (newAccess) setAccess(newAccess);
  return newAccess;
}

export function bootstrapAuthFromStorage() {
  const token = localStorage.getItem('access');
  if (token) setAccess(token);
}

// Attach token on every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401 once, try refresh then retry the original request
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshing) {
        refreshing = true;
        try {
          await tryRefresh();
        } finally {
          refreshing = false;
          waiters.forEach((w) => w());
          waiters = [];
        }
      } else {
        await new Promise<void>((resolve) => waiters.push(resolve));
      }

      if (accessToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      }
    }
    return Promise.reject(err);
  }
);
