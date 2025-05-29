import { PlayerFE } from '@bomber-app/database';
import { api } from '../api';

export const getPlayerById = async (id: string): Promise<PlayerFE> => {
  const res = await api.get(`/api/players/${id}`);
  return res.data;
};
