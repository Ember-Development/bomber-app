import { Prisma, PublicUserFE } from '@bomber-app/database';
import { api } from './api';

export interface CreateUserInput {
  email: string;
  pass: string;
  fname: string;
  lname: string;
  phone?: string;
  primaryRole: Prisma.UserCreateInput['primaryRole'];
  adminID?: string;
  coachID?: string;
  regCoachID?: string;
  playerID?: string;
  parentID?: string;
  fanID?: string;
}

export const fetchUsers = async (): Promise<PublicUserFE[]> => {
  const { data } = await api.get<PublicUserFE[]>('/users');
  return data;
};

export const createUser = async (
  payload: CreateUserInput
): Promise<PublicUserFE | null> => {
  try {
    const { data } = await api.post<PublicUserFE>('/users', payload);
    return data;
  } catch (err) {
    console.error('Failed to create user', err);
    return null;
  }
};

export const updateUser = async (
  id: string,
  payload: Partial<CreateUserInput>
): Promise<PublicUserFE | null> => {
  try {
    const { data } = await api.put<PublicUserFE>(`/users/${id}`, payload);
    return data;
  } catch (err) {
    console.error('Failed to update user', err);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/users/${id}`);
    return true;
  } catch (err) {
    console.error('Failed to delete user', err);
    return false;
  }
};
