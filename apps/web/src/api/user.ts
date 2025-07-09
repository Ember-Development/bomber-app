import { api } from './api';

export const fetchUsers = async () => {
  const { data } = await api.get('/users');
  console.log('data', data);
  return data;
};
