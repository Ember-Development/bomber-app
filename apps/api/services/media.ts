import { prisma, Media as MediaDB, MediaCategory } from '@bomber-app/database';

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
