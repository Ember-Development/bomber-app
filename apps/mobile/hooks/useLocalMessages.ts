import { MessageFE } from '@bomber-app/database';
import { useState } from 'react';

export function useLocalMessages(initialMessages: MessageFE[] = []) {
  const [localMessages, setLocalMessages] = useState<MessageFE[]>([]);

  const addLocalMessage = (message: MessageFE) => {
    setLocalMessages((prev) => [...prev, message]);
  };

  const replaceLocalMessage = (serverMessage: MessageFE) => {
    setLocalMessages((prev) =>
      prev.map((msg) => {
        if (
          msg.text === serverMessage.text &&
          msg.sender.id === serverMessage.sender.id &&
          msg.id.startsWith('temp-')
        ) {
          return serverMessage;
        }
        return msg;
      })
    );
  };

  const clearLocalMessages = () => {
    setLocalMessages([]);
  };

  const allMessages = [...localMessages, ...initialMessages];

  const uniqueMessages = Array.from(
    new Map(allMessages.map((msg) => [msg.id, msg])).values()
  );

  return {
    localMessages,
    addLocalMessage,
    replaceLocalMessage,
    clearLocalMessages,
    allMessages: uniqueMessages,
  };
}
