import React, { createContext, useContext, useState, ReactNode } from 'react';
import NotificationToast from '@/components/ui/molecules/NotificationToast';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

interface ToastData {
  title: string;
  body: string;
  imageUrl?: string | null;
  deepLink?: string | null;
}

interface ToastContextType {
  showToast: (data: ToastData) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [notificationData, setNotificationData] = useState<ToastData | null>(
    null
  );
  const router = useRouter();

  const showToast = (data: ToastData) => {
    setNotificationData(data);
    setVisible(true);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  const handlePress = (deepLink?: string | null) => {
    if (!deepLink) return;

    // Extract event ID from deep link
    const extractEventId = (link: string): string | null => {
      const eventMatch = link.match(/(?:event|events)\/([a-zA-Z0-9-]+)/);
      return eventMatch ? eventMatch[1] : null;
    };

    const eventId = extractEventId(deepLink);

    if (eventId) {
      // Navigate to events page with the event ID
      router.push(`/events?eventId=${eventId}` as any);
    } else if (deepLink.startsWith('bomber://')) {
      // Handle bomber:// deep links
      const path = deepLink.replace('bomber://', '');
      if (path) {
        router.push(path as any);
      }
    } else {
      // External URLs
      Linking.openURL(deepLink).catch(() => {});
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {notificationData && (
        <NotificationToast
          visible={visible}
          title={notificationData.title}
          body={notificationData.body}
          imageUrl={notificationData.imageUrl}
          deepLink={notificationData.deepLink}
          onDismiss={handleDismiss}
          onPress={handlePress}
        />
      )}
    </ToastContext.Provider>
  );
}
