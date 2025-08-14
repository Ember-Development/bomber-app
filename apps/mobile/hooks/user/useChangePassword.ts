import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/api';
import type { AxiosError } from 'axios';

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export function useChangePassword(userId: string) {
  return useMutation<void, AxiosError, ChangePasswordPayload>({
    mutationFn: async (body) => {
      await api.post(`/api/users/${userId}/change-password`, body);
    },
  });
}
