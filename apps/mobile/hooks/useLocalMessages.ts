import { useState, useEffect } from 'react';
import { MessageFE } from '@bomber-app/database';

export function useLocalMessages(initialMessages: MessageFE[]) {
  const [localMessages, setLocalMessages] =
    useState<MessageFE[]>(initialMessages);

  const addLocalMessage = (message: MessageFE) => {
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

  // ✨ THE FIX:
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
