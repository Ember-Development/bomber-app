import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchUserChats,
  fetchUserEvents,
  fetchUsers,
  updateUser,
} from '@/api/user';
import { ChatFE, PublicUserFE, UserFE } from '@bomber-app/database';
import { UserEvent } from '@/types';

const PAGE_SIZE = 10;

export const useUsers = () => {
  return useQuery<PublicUserFE[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

export const useUserEvents = (userId?: string) => {
  return useQuery<UserEvent[]>({
    queryKey: ['user-events', userId],
    queryFn: () => fetchUserEvents(userId!),
    enabled: !!userId,
  });
};

export const useUserChats = (userId?: string) => {
  return useQuery<ChatFE[]>({
    queryKey: ['user-chats', userId],
    queryFn: () => fetchUserChats(userId!),
    enabled: !!userId,
  });
};

export const useUpdateUser = (
  userId: string,
  p0: { onSuccess: () => void }
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserFE>) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
