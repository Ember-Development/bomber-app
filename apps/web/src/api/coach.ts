<<<<<<< HEAD
import { CoachFE, Prisma, RegCoachFE, TeamFE } from '@bomber-app/database';
=======
import { Prisma, TeamFE } from '@bomber-app/database';
>>>>>>> events-tab
import { api } from './api';

type UpdateCoachInput = Prisma.CoachUpdateInput;

export type UpdateCoachPayload = Omit<UpdateCoachInput, 'address'> & {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

<<<<<<< HEAD
export const fetchCoaches = async (): Promise<CoachFE[]> => {
  const { data } = await api.get<CoachFE[]>('/coaches');
  return data;
};

export const fetchCoachById = async (id: string): Promise<CoachFE> => {
  const { data } = await api.get<CoachFE>(`/coaches/${id}`);
  return data;
};

export const fetchRegCoaches = async (): Promise<RegCoachFE[]> => {
  // assuming backend route is /reg-coaches (separate router from /coaches)
  const { data } = await api.get<RegCoachFE[]>('/regCoaches');
  return data;
};

=======
>>>>>>> events-tab
export const updateCoach = async (id: string, payload: UpdateCoachPayload) => {
  const { data } = await api.put(`/coaches/${id}`, payload);
  return data;
};

export const removeCoachFromTeam = async (
  coachId: string,
  teamId: string
): Promise<TeamFE> => {
  const { data } = await api.post<TeamFE>('/coaches/remove-coach-from-team', {
    coachId,
    teamId,
  });
  return data;
};
