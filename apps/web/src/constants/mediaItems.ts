// apps/web/src/constants/mediaItems.ts
import bomber1 from '@/assets/images/bomberimage1.jpg';
import bomber2 from '@/assets/images/article2.jpg';
import bomber3 from '@/assets/images/article3.jpg';
import bomber4 from '@/assets/images/article4.jpg';
import vid1 from '@/assets/images/video1.jpg';
import vid2 from '@/assets/images/video2.jpg';
import vid3 from '@/assets/images/video3.jpg';
import vid4 from '@/assets/images/video4.jpg';

export interface Article {
  id: string;
  title: string;
  imageUrl: string;
  summary: string;
  author: string;
  date: string; // ISO date
  contentUrl: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string; // e.g. "3:45"
  publishedAt: string; // ISO date
}

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'Bombers Fastpitch Launches Offseason Training Program',
    imageUrl: bomber1,
    summary:
      'Our new offseason program combines strength training, skill drills, and mental conditioning to take your game to the next level.',
    author: 'Jade Smith',
    date: '2025-01-15',
    contentUrl: '/articles/offseason-training-program',
  },
  {
    id: 'a2',
    title: 'Injury Prevention: Top Tips for Young Pitchers',
    imageUrl: bomber1,
    summary:
      'Learn key warm-up routines, mechanics adjustments, and recovery protocols to keep pitchers healthy throughout the season.',
    author: 'Coach Allen',
    date: '2025-02-10',
    contentUrl: '/articles/injury-prevention-pitchers',
  },
  {
    id: 'a3',
    title: 'Nutrition Guide: Fueling for Peak Performance',
    imageUrl: bomber1,
    summary:
      'Discover meal plans, hydration strategies, and snack ideas designed for athletes in training and competition.',
    author: 'Nutrition Team',
    date: '2025-03-05',
    contentUrl: '/articles/nutrition-guide',
  },
  {
    id: 'a4',
    title: 'The Art of Base Running: Beating Defense with Speed & Strategy',
    imageUrl: bomber1,
    summary:
      'Master steal timing, first-step explosiveness, and rounding techniques to maximize your advantage on the basepaths.',
    author: 'Speed Coach',
    date: '2025-04-01',
    contentUrl: '/articles/base-running-art',
  },
];

export const VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Bombers Fastpitch Season Highlights',
    thumbnailUrl: bomber1,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '4:20',
    publishedAt: '2025-01-20',
  },
  {
    id: 'v2',
    title: 'Coach’s Corner: Perfecting Your Swing',
    thumbnailUrl: bomber1,
    videoUrl: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    duration: '6:15',
    publishedAt: '2025-02-18',
  },
  {
    id: 'v3',
    title: 'Defensive Drills You Can Do at Home',
    thumbnailUrl: bomber1,
    videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    duration: '5:05',
    publishedAt: '2025-03-12',
  },
  {
    id: 'v4',
    title: 'Summer Camp Recap & Player Interviews',
    thumbnailUrl: bomber1,
    videoUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    duration: '7:30',
    publishedAt: '2025-04-28',
  },
];
