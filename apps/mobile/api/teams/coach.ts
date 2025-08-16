import { CoachFE, TeamFE } from '@bomber-app/database';
import { api } from '../api';

export const getCoachById = async (id: string): Promise<CoachFE> => {
  const res = await api.get(`/api/coaches/${id}`);
  return res.data;
};

export const updateCoach = async (
  id: string,
  payload: any
): Promise<CoachFE> => {
  const { data } = await api.put(`/api/coaches/${id}`, payload);
  return data;
};

export const deleteCoach = async (id: string): Promise<void> => {
  await api.delete(`/api/coaches/${id}`);
};

export const removeCoachFromTeam = async (
  coachId: string,
  teamId: string
): Promise<TeamFE> => {
  const { data } = await api.post<TeamFE>(
    '/api/coaches/remove-coach-from-team',
    {
      coachId,
      teamId,
    }
  );
  return data;
};
