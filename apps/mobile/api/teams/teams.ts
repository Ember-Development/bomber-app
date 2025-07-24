import { api } from '../api';
import { TeamFE, Trophy } from '@bomber-app/database';

export const fetchTeams = async (): Promise<TeamFE[]> => {
  try {
    const response = await api.get<TeamFE[]>('/api/teams');
    console.log('team', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return [];
  }
};

export const getTeamById = async (id: string): Promise<TeamFE> => {
  const res = await api.get(`/api/teams/${id}`);
  return res.data;
};

export const addTrophy = async ({
  teamId,
  title,
  imageURL,
}: {
  teamId: string;
  title: string;
  imageURL: string;
}): Promise<Trophy> => {
  const res = await api.post(`/api/teams/${teamId}/trophies`, {
    title,
    imageURL,
  });
  return res.data;
};

export const updateTrophy = async (
  teamId: string,
  trophyId: string,
  data: { title?: string; imageURL?: string }
): Promise<Trophy> => {
  const res = await api.put(`/api/teams/${teamId}/trophies/${trophyId}`, data);
  return res.data;
};

export const deleteTrophy = async ({
  teamId,
  trophyId,
}: {
  teamId: string;
  trophyId: string;
}): Promise<void> => {
  await api.delete(`/api/teams/${teamId}/trophies/${trophyId}`);
};
