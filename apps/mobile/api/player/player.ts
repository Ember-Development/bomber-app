import { PlayerFE } from '@bomber-app/database';
import { api } from '../api';

export const fetchPlayers = async (): Promise<PlayerFE[]> => {
  try {
    const response = await api.get<PlayerFE[]>('/api/players');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return [];
  }
};

export const getUnassignedPlayers = async (params?: {
  cursor?: string;
  limit?: number;
  search?: string;
  ageGroup?: string;
}): Promise<{ items: PlayerFE[]; nextCursor?: string | null }> => {
  const { data } = await api.get('/api/players/unassigned', { params });
  return data;
};

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

export const addPlayerToTeam = async ({
  playerId,
  teamCode,
}: {
  playerId: string;
  teamCode: string;
}): Promise<PlayerFE> => {
  const res = await api.post('/api/players/add-to-team', {
    playerId,
    teamCode,
  });
  return res.data;
};
