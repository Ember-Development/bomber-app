import { Ionicons } from '@expo/vector-icons';

// Legacy Items
export const legacyItems: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  routes: string;
}[] = [
  { title: 'Bombers History', icon: 'book-outline', routes: '/side/history' },
  { title: 'Bombers Alumni', icon: 'people-outline', routes: '/side/alumnis' },
  {
    title: 'Recent Commitments',
    icon: 'medal-outline',
    routes: '/side/commitments',
  },
];

// Mock Articles
export const mockArticles = [
  {
    title: 'BOMBERS FASTPITCH PARTNERS WITH INDUSTRY LEADING TECH COMPANIES',
    image: require('@/assets/images/bomberimage1.jpg'),
    onPress: () => {},
  },
];

// Mock Videos
export const mockVideos = [
  {
    title: 'BOMBER ACCESS EP 1',
    image: require('@/assets/images/bomberimage1.jpg'),
    onPress: () => {},
  },
  {
    title: 'BOMBER ACCESS EP 2',
    image: require('@/assets/images/bomberimage1.jpg'),
    onPress: () => {},
  },
];
