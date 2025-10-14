// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // no withCredentials, no default headers, no interceptors
});

// (one-time cleanup while you develop)
localStorage.removeItem('access');
localStorage.removeItem('refresh');
