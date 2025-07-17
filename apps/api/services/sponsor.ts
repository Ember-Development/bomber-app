// services/sponsor.ts
import { prisma, SponsorDB } from '@bomber-app/database';

interface SponsorCreateInput {
  title: string;
  url: string;
  logoUrl: string;
}

interface SponsorUpdateInput {
  title?: string;
  url?: string;
  logoUrl?: string;
}

export const sponsorService = {
  getAllSponsors: async (): Promise<SponsorDB[]> => {
    return prisma.sponsor.findMany();
  },

  getSponsorById: async (id: string): Promise<SponsorDB | null> => {
    return prisma.sponsor.findUnique({ where: { id } });
  },

  createSponsor: async (data: SponsorCreateInput): Promise<SponsorDB> => {
    return prisma.sponsor.create({ data });
  },

  updateSponsor: async (
    id: string,
    data: SponsorUpdateInput
  ): Promise<SponsorDB> => {
    return prisma.sponsor.update({
      where: { id },
      data,
    });
  },

  deleteSponsor: async (id: string): Promise<SponsorDB> => {
    return prisma.sponsor.delete({ where: { id } });
  },
};
