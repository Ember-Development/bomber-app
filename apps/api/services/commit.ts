import { CommitDB, prisma } from '@bomber-app/database';

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

  create: async (data: CommitCreateInput) => {
    return prisma.commit.create({
      data: {
        ...data,
        committedDate:
          data.committedDate instanceof Date
            ? data.committedDate
            : new Date(data.committedDate),
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
