import { prisma } from '../api';

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

  ensureForUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        parent: true,
        coach: { include: { address: true } },
        player: { include: { address: true } },
      },
    });

    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.parent) return user.parent;

    const addressConnect = user.coach?.address?.id
      ? { connect: { id: user.coach.address.id } }
      : user.player?.address?.id
        ? { connect: { id: user.player.address.id } }
        : null;

    const parent = await prisma.parent.create({
      data: {
        address: addressConnect ?? {
          create: {
            address1: '',
            address2: '',
            city: '',
            state: '',
            zip: '',
          },
        },
        user: { connect: { id: userId } },
      },
    });

    return parent;
  },
};
