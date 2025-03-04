import { useEffect, useState } from 'react';
import mockData from '@/mock-data/mockData.json';
// types
import { ChatFE, UserRole } from '@bomber-app/database';

export function useChats() {
  const [chats, setChats] = useState<ChatFE[]>([]);
  const [mutedGroups, setMutedGroups] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [unreadGroups, setUnreadGroups] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsloading] = useState(true);

  // TESTING USE ONLY
  const loadChats = () => {
    setIsloading(true);
    setRefresh(true);
    // Transform mock data to match ChatFE
    const fixedChats: ChatFE[] = mockData.chats.map((chat) => ({
      ...chat,
      users: chat.users.map((user) => ({
        ...user,
        primaryRole: user.primaryRole as UserRole,
      })),
      messages: chat.messages.map((message) => ({
        ...message,
        createdAt: new Date(message.createdAt),
      })),
    }));

    setChats(fixedChats);
    setIsloading(false);
    setRefresh(false);

    // mock a unread message
    const newUnreadGroups = fixedChats.reduce(
      (acc, chat) => {
        acc[chat.id] = chat.messages.length > 0;
        return acc;
      },
      {} as { [key: number]: boolean }
    );
    setUnreadGroups(newUnreadGroups);
  };

  useEffect(() => {
    loadChats();
  }, []);

  return {
    chats,
    mutedGroups,
    unreadGroups,
    isLoading,
    refresh,
    loadChats,
    setMutedGroups,
  };
}
