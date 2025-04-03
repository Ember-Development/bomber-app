import { ChatFE, MessageFE, UserFE, UserRole } from '@bomber-app/database';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'http://192.168.1.76:3000';
// Fetch chat messages
const fetchChatMessages = async (chatId: string) => {
  const res = await fetch(`${API_BASE}/api/messages/${chatId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
};

// Fetch chat details
const fetchChatDetails = async (chatId: string) => {
  const res = await fetch(`${API_BASE}/api/groups`);
  if (!res.ok) throw new Error('Failed to fetch group');
  const allGroups = await res.json();
  return allGroups.find((group: any) => group.id === chatId) ?? null;
};

// React Query Hooks
export const useChatMessages = (chatId: string) => {
  return useQuery<MessageFE[]>({
    queryKey: ['chatMessages', chatId],
    queryFn: () => fetchChatMessages(chatId),
    staleTime: 1000 * 30, // Cache for 30 seconds
  });
};

export const useChatDetails = (chatId: string) => {
  return useQuery<ChatFE | null>({
    queryKey: ['chatDetails', chatId],
    queryFn: () => fetchChatDetails(chatId),
  });
};
