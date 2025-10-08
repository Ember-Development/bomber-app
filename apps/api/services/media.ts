import { MediaDB as MediaDB } from '@bomber-app/database';
import { MediaCategory } from '@bomber-app/database/generated/client';
import { prisma } from '../api';

export interface MediaCreateInput {
  title: string;
  videoUrl: string;
  category: MediaCategory;
}

export interface MediaUpdateInput {
  title?: string;
  videoUrl?: string;
  category: MediaCategory;
}

export const mediaService = {
  getAllMedia: async (): Promise<MediaDB[]> => prisma.media.findMany(),

  getMediaById: async (id: string): Promise<MediaDB | null> =>
    prisma.media.findUnique({ where: { id } }),

  createMedia: async (data: MediaCreateInput): Promise<MediaDB> =>
    prisma.media.create({ data }),

  updateMedia: async (id: string, data: MediaUpdateInput): Promise<MediaDB> =>
    prisma.media.update({ where: { id }, data }),

  deleteMedia: async (id: string): Promise<MediaDB> =>
    prisma.media.delete({ where: { id } }),
};
