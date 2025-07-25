import { PlayerFE } from '@bomber-app/database';
import { api } from '../api';

export const getPlayerById = async (id: string): Promise<PlayerFE> => {
  const res = await api.get(`/api/players/${id}`);
  return res.data;
};

export const getAlumniPlayersPaginated = async ({
  cursor,
  limit = 20,
}: {
  cursor?: string;
  limit?: number;
}) => {
  const res = await api.get('/api/players/alumni', {
    params: { cursor, limit },
  });
  return res.data; // Should return PlayerFE[]
};

export const updatePlayer = async (
  id: string,
  data: Partial<PlayerFE>
): Promise<PlayerFE> => {
  const res = await api.put(`/api/players/${id}`, data);
  return res.data;
};

export const deletePlayer = async (id: string): Promise<void> => {
  await api.delete(`/api/players/${id}`);
};
