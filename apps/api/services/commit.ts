import { CommitDB } from '@bomber-app/database';
import { prisma } from '../api';

type CommitCreateInput = Omit<CommitDB, 'id' | 'players'>;
type CommitUpdateInput = Partial<CommitCreateInput>;

export const commitService = {
  getAll: async () => {
    return prisma.commit.findMany({
      orderBy: { committedDate: 'desc' },
      include: {
        players: {
          include: {
            user: true,
            address: true,
          },
        },
      },
    });
  },

  getById: async (id: string) => {
    return prisma.commit.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            user: true,
            address: true,
          },
        },
      },
    });
  },

  createCommit: async (data: {
    name: string;
    state: string;
    city: string;
    imageUrl?: string;
    committedDate: Date;
  }) => {
    return prisma.commit.create({
      data: {
        name: data.name,
        state: data.state,
        city: data.city,
        imageUrl: data.imageUrl || '',
        committedDate: data.committedDate,
      },
    });
  },

  update: async (id: string, data: CommitUpdateInput) => {
    return prisma.commit.update({
      where: { id },
      data: {
        ...data,
        ...(data.committedDate && {
          committedDate:
            data.committedDate instanceof Date
              ? data.committedDate
              : new Date(data.committedDate),
        }),
      },
    });
  },

  remove: async (id: string) => {
    return prisma.commit.delete({ where: { id } });
  },
};
