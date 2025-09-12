import { CommitFE } from '@bomber-app/database';
import { api } from '../api';

export const fetchCommits = async (): Promise<CommitFE[]> => {
  const { data } = await api.get('/api/commits');
  return data;
};

export const fetchCommitById = async (id: string): Promise<CommitFE> => {
  const { data } = await api.get(`/api/commits/${id}`);
  return data;
};

export const createCommit = async (
  commit: Omit<CommitFE, 'id' | 'players'>
): Promise<CommitFE> => {
  const { data } = await api.post('/api/commits', commit);
  return data;
};

export const updateCommit = async (
  id: string,
  commit: Partial<Omit<CommitFE, 'id' | 'players'>>
): Promise<CommitFE> => {
  const { data } = await api.patch(`/api/commits/${id}`, commit);
  return data;
};

export const deleteCommit = async (id: string): Promise<void> => {
  await api.delete(`/api/commits/${id}`);
};
