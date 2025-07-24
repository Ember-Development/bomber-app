import { Prisma, prisma } from '@bomber-app/database';
import { Role } from '../auth/permissions';

export interface CreatePlayerInput extends Prisma.PlayerCreateInput {}
export interface UpdatePlayerInput extends Prisma.PlayerUpdateInput {}

//FIXME: replace the any once we have full types
const validatePlayer = (player: any) => {
  //TODO: use enums when we have full types
  const isPlayerParentManaged =
    player.ageGroup == '8u' ||
    player.ageGroup == '10u' ||
    player.ageGroup == '12u' ||
    (player.ageGroup == '14u' && player.isTrusted == false);

  const errors = [];

  if (!isPlayerParentManaged) {
    if (!player.addressID)
      errors.push('Self managed players must have an address'); //TODO: perhaps we can do more to validate the address than just checking an ID exists?
  } else {
    if (player.parents.length < 1)
      errors.push(
        'Parent managed players must have at least one parent relation'
      );
  }

  if (errors.length > 0) return errors;
};

export { validatePlayer };

export interface CreatePlayerInput
  extends Omit<Prisma.PlayerCreateInput, 'address'> {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface UpdatePlayerInput
  extends Omit<Prisma.PlayerUpdateInput, 'address'> {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  [key: string]: any;
}

const canAccessPlayer = async (
  actingUserId: string,
  playerId: string,
  role: Role
) => {
  if (role === 'ADMIN') return true;

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      team: {
        select: {
          region: true,
          coaches: {
            where: { userID: actingUserId },
          },
        },
      },
      parents: { where: { userID: actingUserId } },
    },
  });

  if (!player || !player.team) return false;

  switch (role) {
    case 'COACH':
      return player.team.coaches.length > 0;

    case 'REGIONAL_COACH':
      const regionalCoach = await prisma.regCoach.findUnique({
        where: { userID: actingUserId },
      });
      return regionalCoach?.region === player.team.region;

    case 'PARENT':
      return player.parents.length > 0;

    default:
      return false;
  }
};

export const playerService = {
  getPlayerById: async (id: string) => {
    return prisma.player.findUnique({
      where: { id },
      include: {
        user: true,
        team: true,
        parents: true,
        address: true,
      },
    });
  },

  getAllPlayers: async () => {
    return prisma.player.findMany({
      include: {
        user: true,
        team: true,
        parents: true,
        address: true,
      },
    });
  },

  createPlayer: async (data: CreatePlayerInput) => {
    const errors = validatePlayer(data as any);
    if (errors) throw new Error(errors.join('; '));

    const { address1, address2, city, state, zip, ...playerData } = data as any;

    return prisma.player.create({
      data: {
        ...playerData,
        address: address1
          ? {
              create: {
                address1,
                address2,
                city,
                state,
                zip,
              },
            }
          : undefined,
      },
      include: {
        user: true,
        team: true,
        parents: true,
        address: true,
      },
    });
  },

  updatePlayer: async (
    playerId: string,
    data: UpdatePlayerInput,
    actingUserId: string,
    role: Role
  ) => {
    const authorized = await canAccessPlayer(actingUserId, playerId, role);
    if (!authorized) throw new Error('Not authorized to update this player.');

    const { addressID, address1, address2, city, state, zip, ...playerData } =
      data;

    return prisma.player.update({
      where: { id: playerId },
      data: {
        ...playerData,
        address: address1
          ? {
              upsert: {
                create: {
                  address1: address1 ?? '',
                  address2: address2 ?? '',
                  city: city ?? '',
                  state: state ?? '',
                  zip: zip ?? '',
                },
                update: {
                  address1: address1 ?? '',
                  address2: address2 ?? '',
                  city: city ?? '',
                  state: state ?? '',
                  zip: zip ?? '',
                },
              },
            }
          : undefined,
      },
      include: {
        user: true,
        team: true,
        parents: true,
        address: true,
      },
    });
  },

  deletePlayer: async (playerId: string, actingUserId: string, role: Role) => {
    const authorized = await canAccessPlayer(actingUserId, playerId, role);
    if (!authorized) throw new Error('Not authorized to remove this player.');

    return prisma.player.delete({
      where: { id: playerId },
    });
  },
};
