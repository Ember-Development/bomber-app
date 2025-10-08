// services/bannerService.ts
import { BannerDB } from '@bomber-app/database';
import { prisma } from '../api';

interface BannerCreateInput {
  imageUrl: string;
  duration: number;
  expiresAt: Date;
}

export const bannerService = {
  getAllBanners: async (): Promise<BannerDB[]> => prisma.banner.findMany(),

  getBannerById: async (id: string): Promise<BannerDB | null> =>
    prisma.banner.findUnique({ where: { id } }),

  createBanner: async (data: BannerCreateInput): Promise<BannerDB> =>
    prisma.banner.create({ data }),

  updateBanner: async (
    id: string,
    data: Partial<BannerCreateInput>
  ): Promise<BannerDB> => prisma.banner.update({ where: { id }, data }),

  deleteBanner: async (id: string): Promise<BannerDB> =>
    prisma.banner.delete({ where: { id } }),
};
