import { api } from '../api';
import { TeamFE } from '@bomber-app/database';

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
