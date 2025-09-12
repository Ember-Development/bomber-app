import { createLead, CreateLeadPayload } from '@/api/portal/portal';
import { useMutation } from '@tanstack/react-query';

export const useCreateLead = (opts?: {
  onSuccess?: () => void;
  onError?: (e: any) => void;
}) => {
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => createLead(payload),
    onSuccess: () => opts?.onSuccess?.(),
    onError: (e) => opts?.onError?.(e),
  });
};
