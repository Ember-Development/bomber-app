import { useEffect, useState } from 'react';
import mockData from '@/mock-data/mockData.json';
// types
import { ChatFE, UserRole } from '@bomber-app/database';

export function useChats() {
  const [chats, setChats] = useState<ChatFE[]>([]);
  const [mutedGroups, setMutedGroups] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [unreadGroups, setUnreadGroups] = useState<{ [key: string]: boolean }>(
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
      id: chat.id, // Ensure this is a string
      title: chat.title,
      users: chat.users.map((user) => ({
        userID: user.id, // Convert `id` to `userID`
        chatID: chat.id, // Assign chat ID to match expected type
        joinedAt: new Date(), // Mocked, replace with actual date if available
      })),
      messages: chat.messages.map((message) => ({
        id: message.id,
        userID: message.userID,
        chatID: message.chatID,
        text: message.text,
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
      {} as { [key: string]: boolean }
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
