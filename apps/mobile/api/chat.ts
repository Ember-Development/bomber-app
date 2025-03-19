import { ChatFE, MessageFE, UserFE, UserRole } from '@bomber-app/database';
import chatMock from '../mock-data/mockData.json';
import { useQuery } from '@tanstack/react-query';

// Fetch chat messages
const fetchChatMessages = async (chatId: string): Promise<MessageFE[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chat = chatMock.chats.find((c) => c.id === chatId);
      if (!chat) return resolve([]);

      const messages: MessageFE[] = chat.messages.map((msg) => {
        // Find the sender
        const senderUser = chatMock.users.find(
          (user) => user.id === msg.userID
        );
        if (!senderUser) {
          throw new Error(`User with ID ${msg.userID} not found in mock data.`);
        }

        const sender = {
          id: senderUser.id,
          email: senderUser.email,
          phone: senderUser.phone || null,
          pass: senderUser.pass,
          fname: senderUser.fname,
          lname: senderUser.lname,
          primaryRole: senderUser.primaryRole as UserRole,
        };

        return {
          id: msg.id,
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          userID: msg.userID,
          chatID: msg.chatID,
          sender,
          chat: { id: chatId, title: chat.title },
        };
      });

      resolve(messages);
    }, 500);
  });
};

// Fetch chat details
const fetchChatDetails = async (chatId: string): Promise<ChatFE | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chat = chatMock.chats.find((c) => c.id === chatId);
      if (!chat) return resolve(null);

      resolve({
        id: chat.id,
        title: chat.title,
        users: chat.users.map((user) => ({
          userID: user.id,
          chatID: chat.id,
          joinedAt: new Date(),
        })),
        messages: chat.messages.map((msg) => ({
          id: msg.id,
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          userID: msg.userID,
          chatID: msg.chatID,
        })),
      });
    }, 500);
  });
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
