// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Remove auth tokens since this is a public site
localStorage.removeItem('access');
localStorage.removeItem('refresh');
