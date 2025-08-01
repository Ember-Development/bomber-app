import { useState, useEffect } from 'react';
import { MessageFE, LocalMessage } from '@bomber-app/database';

type CombinedMessage = MessageFE | LocalMessage;

export function useLocalMessages(initialMessages: MessageFE[]) {
  const [localMessages, setLocalMessages] =
    useState<CombinedMessage[]>(initialMessages);

  const addLocalMessage = (message: LocalMessage) => {
    console.log('📤 Adding local message:', message);
    setLocalMessages((prev) => [...prev, message]);
  };

  const replaceLocalMessage = (newMessage: MessageFE) => {
    setLocalMessages((prev) =>
      prev.map((m) =>
        m.id.endsWith('-temp') && m.text === newMessage.text ? newMessage : m
      )
    );
  };

  const clearLocalMessages = () => {
    setLocalMessages([]);
  };

  useEffect(() => {
    setLocalMessages(initialMessages);
  }, [initialMessages]);

  return {
    localMessages,
    addLocalMessage,
    replaceLocalMessage,
    clearLocalMessages,
  };
}
