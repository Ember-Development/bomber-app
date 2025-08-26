import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

export type SideMenuItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  routes?: Href; // optional; only present when it actually navigates
};

export const SIDEMENU_ITEMS = [
  {
    name: 'Teams',
    icon: 'people-outline',
    routes: '/teams',
  },
  {
    name: 'Media',
    icon: 'play-outline',
    // routes omitted on purpose; it's a submenu toggle
  },
  {
    name: 'Legacy',
    icon: 'school-outline',
    // routes omitted; submenu toggle
  },
  {
    name: 'Bomber Portal',
    icon: 'book-outline',
    routes: '/side/bomberportal',
  },
  {
    name: 'About Us',
    icon: 'information-circle-outline',
    routes: '/side/about',
  },
  {
    name: 'Coaches Development',
    icon: 'baseball-outline',
    // no route yet
  },
  {
    name: 'Player Development',
    icon: 'star-outline',
    // no route yet
  },
] as const satisfies ReadonlyArray<SideMenuItem>;
