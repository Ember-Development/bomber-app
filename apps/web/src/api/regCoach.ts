<<<<<<< HEAD
import { RegCoachFE } from '@bomber-app/database';
=======
>>>>>>> events-tab
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
<<<<<<< HEAD

export async function upsertRegCoachRegion(
  userId: string | number,
  region: string
): Promise<RegCoachFE> {
  const { data } = await api.patch(`/users/${userId}/reg-coach`, { region });
  return data;
}

export async function demoteRegCoach(
  userId: string | number,
  newRole: 'COACH' | 'ADMIN' | 'FAN'
) {
  await api.delete(`/users/${userId}/reg-coach`, { params: { newRole } });
}
=======
>>>>>>> events-tab
