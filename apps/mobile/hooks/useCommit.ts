import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCommits,
  fetchCommitById,
  createCommit,
  updateCommit,
  deleteCommit,
} from '../api/college/commit';
import { CommitFE } from '@bomber-app/database';

export const useCommits = () => {
  return useQuery<CommitFE[]>({
    queryKey: ['commits'],
    queryFn: fetchCommits,
  });
};

export const useCommit = (id: string) => {
  return useQuery<CommitFE>({
    queryKey: ['commit', id],
    queryFn: () => fetchCommitById(id),
    enabled: !!id,
  });
};

export const useCreateCommit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
    },
  });
};

export const useUpdateCommit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<CommitFE, 'id' | 'players'>>;
    }) => updateCommit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
      queryClient.invalidateQueries({ queryKey: ['commit', id] });
    },
  });
};

export const useDeleteCommit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCommit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
    },
  });
};
