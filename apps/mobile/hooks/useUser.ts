import { useQuery } from '@tanstack/react-query';
import { fetchUserChats, fetchUserEvents, fetchUsers } from '@/api/user';
import { ChatFE, PublicUserFE } from '@bomber-app/database';
import { UserEvent } from '@/types';

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
