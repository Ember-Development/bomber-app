// constants/sidebarItems.ts

import { Ionicons } from '@expo/vector-icons';

export const SIDEMENU_ITEMS: {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'Teams', icon: 'people-outline' },
  { name: 'Media', icon: 'play-outline' },
  { name: 'Legacy', icon: 'school-outline' },
  { name: 'Bomber Portal', icon: 'book-outline' },
  { name: 'About Us', icon: 'flag-outline' },
  { name: 'Player Development', icon: 'star-outline' },
];
