import { AgeGroup, Prisma, prisma, Regions, State } from '@bomber-app/database';
import { getUniqueTeamCode } from '../utils/teamCode';
import {
  ensureUserIsCoach,
  ensureUserIsPlayer,
} from '../utils/ensureUserisCoach';
import {
  ensureCoachRecordFor,
  ensurePlayerRecordFor,
} from '../utils/createCoachRecord';
import { Role } from '../auth/permissions';

export interface CreateTeamInput {
  name: string;
  ageGroup: AgeGroup;
  region: Regions;
  state: State;
  headCoachUserID?: string | null;
}

export interface UpdateTeamInput {
  name?: string;
  ageGroup?: AgeGroup;
  region?: Regions;
  state?: State;
  headCoachUserID?: string | null;
}

type TeamWithPlayers = Prisma.TeamGetPayload<{
  include: {
    trophyCase: true;
    players: {
      include: {
        user: true;
        commit: { select: { imageUrl: true; name: true } };
      };
    };
    coaches: { include: { user: true } };
    headCoach: { include: { user: true } };
  };
}>;

// team sort
const AGE_RANK: Record<string, number> = {
  U18: 1,
  U16: 2,
  U14: 3,
  U12: 4,
  U10: 5,
  U8: 6,
  ALUMNI: 999,
};

const isAcademyName = (name: string) => name.toLowerCase().includes('academy');

function teamComparator(a: any, b: any) {
  // Age group order: U18 -> U8 -> ALUMNI
  const ageCmp = (AGE_RANK[a.ageGroup] ?? 999) - (AGE_RANK[b.ageGroup] ?? 999);
  if (ageCmp !== 0) return ageCmp;

  // For U18..U12, Academy first; for U10/U8, no special handling
  const ageTop = new Set(['U18', 'U16', 'U14', 'U12']);
  if (ageTop.has(a.ageGroup) && ageTop.has(b.ageGroup)) {
    const aAcad = isAcademyName(a.name) ? 0 : 1;
    const bAcad = isAcademyName(b.name) ? 0 : 1;
    if (aAcad !== bAcad) return aAcad - bAcad;
  }

  // A-Z by team name
  return a.name.localeCompare(b.name);
}

export const canAccessTrophy = async (
  trophyId: string,
  actingUserId: string,
  role: Role
): Promise<boolean> => {
  if (role === 'ADMIN') return true;

  const trophy = await prisma.trophy.findUnique({
    where: { id: trophyId },
    include: {
      team: {
        include: {
          coaches: { where: { userID: actingUserId } },
        },
      },
    },
  });

  if (!trophy || !trophy.team) return false;

  switch (role) {
    case 'REGIONAL_COACH':
      const regCoach = await prisma.regCoach.findUnique({
        where: { userID: actingUserId },
      });
      return trophy.team.region === regCoach?.region;

    case 'COACH':
      return trophy.team.coaches.length > 0;

    default:
      return false;
  }
};

export const teamService = {
  getAllTeams: async () => {
    const teams = await prisma.team.findMany({
      include: {
        trophyCase: true,
        players: {
          include: {
            user: true,
            team: true,
            parents: true,
            address: true,
          },
        },
        coaches: {
          include: {
            user: true,
          },
        },
        headCoach: {
          include: {
            user: true,
          },
        },
      },
    });

    return teams.sort(teamComparator);
  },

  getTeamById: async (id: string): Promise<TeamWithPlayers | null> => {
    return prisma.team.findUnique({
      where: { id },
      include: {
        trophyCase: true,
        players: {
          include: {
            user: true,
            commit: { select: { imageUrl: true, name: true } },
          },
        },
        coaches: { include: { user: true } },
        headCoach: { include: { user: true } },
      },
    });
  },

  getTeamByCode: async (code: string) => {
    return prisma.team.findUnique({
      where: { teamCode: code },
      include: {
        players: true,
        coaches: true,
        headCoach: true,
        trophyCase: true,
      },
    });
  },

  getMyTeams: async (userId: string) => {
    return prisma.team.findMany({
      where: {
        OR: [
          { headCoach: { userID: userId } },
          { coaches: { some: { userID: userId } } },
        ],
      },
      include: {
        trophyCase: true,
        players: {
          include: { user: true },
        },
        coaches: {
          include: { user: true },
        },
        headCoach: {
          include: { user: true },
        },
      },
    });
  },

  addCoachToTeam: async (teamID: string, userID: string) => {
    await ensureUserIsCoach(userID);
    const coachID = await ensureCoachRecordFor(userID);
    await prisma.team.update({
      where: { id: teamID },
      data: { coaches: { connect: { id: coachID } } },
    });
    return prisma.team.findUnique({
      where: { id: teamID },
      include: {
        coaches: { include: { user: true } },
        headCoach: { include: { user: true } },
        players: true,
        trophyCase: true,
      },
    });
  },

  addPlayerToTeam: async (teamID: string, userID: string) => {
    await ensureUserIsPlayer(userID);
    await ensurePlayerRecordFor(userID, teamID);
    return prisma.team.findUnique({
      where: { id: teamID },
      include: {
        players: { include: { user: true } },
        coaches: { include: { user: true } },
        headCoach: { include: { user: true } },
        trophyCase: true,
      },
    });
  },

  createTeam: async (data: CreateTeamInput) => {
    const teamCode = await getUniqueTeamCode();

    let headCoachID: string | null = null;
    if (data.headCoachUserID) {
      await ensureUserIsCoach(data.headCoachUserID);
      headCoachID = await ensureCoachRecordFor(data.headCoachUserID);
    }

    const team = await prisma.team.create({
      data: {
        name: data.name,
        ageGroup: data.ageGroup,
        region: data.region,
        state: data.state,
        teamCode,
        headCoachID,
      },
      include: {
        trophyCase: true,
        players: true,
        coaches: { include: { user: true } },
        headCoach: { include: { user: true } },
      },
    });

    return team;
  },

  updateTeam: async (id: string, data: UpdateTeamInput) => {
    let headCoachID: string | null = null;
    if (data.headCoachUserID) {
      await ensureUserIsCoach(data.headCoachUserID);
      headCoachID = await ensureCoachRecordFor(data.headCoachUserID);
    }

    return prisma.team.update({
      where: { id },
      data: {
        name: data.name,
        ageGroup: data.ageGroup,
        region: data.region,
        state: data.state,
        headCoachID,
      },
      include: {
        trophyCase: true,
        players: true,
        coaches: { include: { user: true } },
        headCoach: { include: { user: true } },
      },
    });
  },

  deleteTeam: async (id: string) => {
    return prisma.team.delete({
      where: { id },
    });
  },

  addTrophy: async (teamID: string, title: string, imageURL: string) => {
    const count = await prisma.trophy.count({ where: { teamID } });
    if (count >= 10) {
      throw new Error('A team may have at most 10 trophies');
    }
    const trophy = await prisma.trophy.create({
      data: { title, imageURL, teamID },
      include: { team: true },
    });
    return trophy;
  },

  updateTrophy: async (
    trophyID: string,
    data: { title?: string; imageURL?: string },
    actingUserId: string,
    role: Role
  ) => {
    const authorized = await canAccessTrophy(trophyID, actingUserId, role);
    if (!authorized) throw new Error('Not authorized to update this trophy.');

    const trophy = await prisma.trophy.update({
      where: { id: trophyID },
      data,
      include: { team: true },
    });
    return trophy;
  },

  deleteTrophy: async (trophyID: string, actingUserId: string, role: Role) => {
    const authorized = await canAccessTrophy(trophyID, actingUserId, role);
    if (!authorized) throw new Error('Not authorized to delete this trophy.');

    await prisma.trophy.delete({ where: { id: trophyID } });
    return true;
  },
};
