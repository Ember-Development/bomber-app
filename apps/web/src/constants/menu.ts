import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  PhotoIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  AcademicCapIcon,
  BellAlertIcon,
<<<<<<< HEAD
  ClipboardDocumentIcon,
  CircleStackIcon,
=======
>>>>>>> events-tab
} from '@heroicons/react/24/outline';

export interface MenuItem {
  name: string;
  path: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const MENU: MenuItem[] = [
  { name: 'Dashboard', path: '/', Icon: HomeIcon },
  { name: 'Teams', path: '/teams', Icon: UsersIcon },
  { name: 'Users', path: '/users', Icon: UserIcon },
  { name: 'Players', path: '/players', Icon: AcademicCapIcon },
<<<<<<< HEAD
  { name: 'Coaches', path: '/coaches', Icon: ClipboardDocumentIcon },
  { name: 'Portal', path: '/portal', Icon: CircleStackIcon },
=======
>>>>>>> events-tab
  { name: 'Events', path: '/events', Icon: CalendarIcon },
  { name: 'Media', path: '/media', Icon: PhotoIcon },
  // { name: 'Legacy', path: '/legacy', Icon: PhotoIcon },
  { name: 'Notifications', path: '/notifications', Icon: BellAlertIcon },
  { name: 'Sponsor', path: '/sponsor', Icon: PhotoIcon },
  { name: 'Message Logs', path: '/logs', Icon: ChatBubbleLeftIcon },
];

export const FOOTER_MENU: MenuItem[] = [
  { name: 'Settings', path: '/settings', Icon: Cog8ToothIcon },
  { name: 'Support', path: '/support', Icon: QuestionMarkCircleIcon },
];
