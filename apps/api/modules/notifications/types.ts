export type Platform = 'ios' | 'android';
export type TargetPlatform = 'both' | 'ios' | 'android';

export interface RegisterDeviceBody {
  userId: string;
  platform: Platform;
  token: string;
  appVersion?: string;
}

export interface Audience {
  all?: boolean;
  roles?: string[];
  regions?: string[];
  teamIds?: string[];
  userIds?: string[];
}

export interface createNotificationBody {
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  platform?: TargetPlatform;
  audience: Audience;
  scheduledAt?: string;
  data?: Record<string, string>;
}

export interface OpenReceiptBody {
  notificationId: string;
}
