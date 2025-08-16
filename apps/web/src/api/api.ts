import axios from 'axios';

const VITE_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
