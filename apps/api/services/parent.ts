import { prisma } from '@bomber-app/database';

export const parentService = {
  getParentById: async (id: string) => {
    return prisma.parent.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        children: {
          include: {
            user: true,
            team: true,
            address: true,
          },
        },
      },
    });
  },

  addChild: async (parentId: string, playerId: string) => {
    return prisma.parent.update({
      where: { id: parentId },
      data: {
        children: { connect: { id: playerId } },
      },
      include: {
        user: true,
        address: true,
        children: { include: { user: true, team: true, address: true } },
      },
    });
  },

  removeChild: async (parentId: string, playerId: string) => {
    return prisma.parent.update({
      where: { id: parentId },
      data: {
        children: { disconnect: { id: playerId } },
      },
      include: {
        user: true,
        address: true,
        children: { include: { user: true, team: true, address: true } },
      },
    });
  },
};
