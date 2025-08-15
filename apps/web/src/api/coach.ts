import { Prisma, TeamFE } from '@bomber-app/database';
import { api } from './api';

type UpdateCoachInput = Prisma.CoachUpdateInput;

export type UpdateCoachPayload = Omit<UpdateCoachInput, 'address'> & {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

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
