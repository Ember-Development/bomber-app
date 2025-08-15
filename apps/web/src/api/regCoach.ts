import { api } from './api';

export const createOrUpdateRegCoach = async (
  userId: string,
  region: string
) => {
  const { data } = await api.post('/regCoaches', { userId, region });
  return data;
};

export const deleteRegCoach = async (userId: string) => {
  await api.delete(`/regCoaches/${userId}`);
  return true;
};
