// constants/sidebarItems.ts

import { Ionicons } from '@expo/vector-icons';

export const SIDEMENU_ITEMS: {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  routes: string;
}[] = [
  {
    name: 'Teams',
    icon: 'people-outline',
    routes: '/teams',
  },
  {
    name: 'Media',
    icon: 'play-outline',
    routes: '',
  },
  {
    name: 'Legacy',
    icon: 'school-outline',
    routes: '',
  },
  {
    name: 'Bomber Portal',
    icon: 'book-outline',
    routes: '',
  },
  {
    name: 'About Us',
    icon: 'information-circle-outline',
    routes: '/side/about',
  },
  {
    name: 'Coaches Development',
    icon: 'baseball-outline',
    routes: '',
  },
  {
    name: 'Player Development',
    icon: 'star-outline',
    routes: '',
  },
];
