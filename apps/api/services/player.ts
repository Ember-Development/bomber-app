import { AgeGroup, CommitDB, Prisma, prisma } from '@bomber-app/database';
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

type CommitCreateInput = Omit<CommitDB, 'id' | 'players'>;
type CommitUpdateInput = Partial<CommitCreateInput>;

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
            select: { userID: true },
          },
        },
      },
      parents: { where: { userID: actingUserId }, select: { userID: true } },
    },
  });

  if (!player) return false;

  const isParentOfPlayer = player.parents.length > 0;
  if (isParentOfPlayer) return true;

  if (role === 'COACH') {
    return !!player.team && player.team.coaches.length > 0;
  }

  if (role === 'REGIONAL_COACH') {
    if (!player.team) return false;
    const rc = await prisma.regCoach.findUnique({
      where: { userID: actingUserId },
      select: { region: true },
    });
    return !!rc && rc.region === player.team.region;
  }

  if (role === 'PARENT') return false;

  return false;
};

export const playerService = {
  getPlayerById: async (id: string) => {
    if (!id || id.length !== 36) {
      throw new Error(`Invalid player ID format: ${id}`);
    }

    return prisma.player.findUnique({
      where: { id },
      include: {
        user: true,
        team: true,
        parents: true,
        address: true,
        commit: { select: { imageUrl: true, name: true } },
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

  getAlumniPlayers: async ({
    cursor,
    limit = 20,
  }: {
    cursor?: string;
    limit?: number;
  }) => {
    return prisma.player.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: { ageGroup: 'ALUMNI' },
      include: {
        user: true,
        team: true,
        parents: true,
        address: true,
      },
      orderBy: {
        gradYear: 'desc',
      },
    });
  },

  getUnassignedPlayers: async ({
    cursor,
    limit = 20,
    search,
    ageGroup,
  }: {
    cursor?: string;
    limit?: number;
    search?: string;
    ageGroup?: string;
  }) => {
    const where: Prisma.PlayerWhereInput = {
      teamID: null,
      ...(ageGroup ? { ageGroup: ageGroup as AgeGroup } : {}),
      ...(search
        ? {
            OR: [
              { user: { fname: { contains: search, mode: 'insensitive' } } },
              { user: { lname: { contains: search, mode: 'insensitive' } } },
              { jerseyNum: { contains: search } },
            ],
          }
        : {}),
    };

    const items = await prisma.player.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where,
      include: {
        commit: { select: { imageUrl: true, name: true } },
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phone: true,
            primaryRole: true,
          },
        },
        team: { select: { id: true, name: true } },
        address: true,
        parents: {
          include: {
            user: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                phone: true,
              },
            },
            address: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    const nextCursor =
      items.length === limit ? items[items.length - 1].id : null;
    return { items, nextCursor };
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

    const {
      addressID,
      address1,
      address2,
      city,
      state,
      zip,
      fname,
      lname,
      email,
      phone,
      commitId,
      college,
      ...playerData
    } = data;

    let commitMutation: any = undefined;
    if (typeof commitId !== 'undefined') {
      commitMutation = commitId
        ? { commit: { connect: { id: String(commitId) } } }
        : { commit: { disconnect: true } };
    }

    return prisma.player.update({
      where: { id: playerId },
      data: {
        ...playerData,
        ...(typeof college !== 'undefined' ? { college } : {}),
        ...(commitMutation ?? {}),
        user: {
          update: {
            fname,
            lname,
            email,
            phone,
          },
        },
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
        parents: {
          include: {
            user: true,
          },
        },
        address: true,
      },
    });
  },

  addPlayerToTeamByCode: async (playerId: string, teamCode: string) => {
    const team = await prisma.team.findFirst({
      where: { teamCode },
    });

    if (!team)
      throw { status: 404, message: 'Team not found with provided code' };

    const player = await prisma.player.update({
      where: { id: playerId },
      data: {
        team: { connect: { id: team.id } },
      },
    });

    return player;
  },

  deletePlayer: async (playerId: string, actingUserId: string, role: Role) => {
    const authorized = await canAccessPlayer(actingUserId, playerId, role);
    if (!authorized) throw new Error('Not authorized to remove this player.');

    return prisma.player.delete({
      where: { id: playerId },
    });
  },

  createAndAttachToPlayer: async (
    playerId: string,
    data: CommitCreateInput
  ) => {
    return prisma.$transaction(async (tx) => {
      const commit = await tx.commit.create({
        data: {
          ...data,
          committedDate:
            data.committedDate instanceof Date
              ? data.committedDate
              : new Date(data.committedDate),
        },
      });

      await tx.player.update({
        where: { id: playerId },
        data: { commitId: commit.id },
      });

      return tx.commit.findUnique({
        where: { id: commit.id },
        include: {
          players: {
            include: { user: true, address: true },
          },
        },
      });
    });
  },
};
