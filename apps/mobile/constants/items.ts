import { Ionicons } from '@expo/vector-icons';

// Legacy Items
export const legacyItems: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { title: 'Bombers History', icon: 'book-outline' },
  { title: 'Bombers Alumni', icon: 'people-outline' },
  { title: 'Recent Commitments', icon: 'medal-outline' },
];

// Mock Articles
export const mockArticles = [
  {
    title: 'BOMBERS FASTPITCH PARTNERS WITH INDUSTRY LEADING TECH COMPANIES',
    image: require('@/assets/images/bomberimage1.jpg'),
    onPress: () => console.log('Article clicked'),
  },
];

// Mock Videos
export const mockVideos = [
  {
    title: 'BOMBER ACCESS EP 1',
    image: require('@/assets/images/bomberimage1.jpg'),
    onPress: () => console.log('Video clicked'),
  },
  {
    title: 'BOMBER ACCESS EP 2',
    image: require('@/assets/images/bomberimage1.jpg'),
    onPress: () => console.log('Video clicked'),
  },
];
