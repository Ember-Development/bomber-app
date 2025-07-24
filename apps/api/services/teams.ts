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

export const teamService = {
  getAllTeams: async () => {
    return prisma.team.findMany({
      include: {
        trophyCase: true,
        players: true,
        // regCoaches: true, // Removed as it is not a valid property
        coaches: true,
        headCoach: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  getTeamById: async (id: string) => {
    return prisma.team.findUnique({
      where: { id },
      include: {
        trophyCase: true,
        players: {
          include: {
            user: true,
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
    data: { title?: string; imageURL?: string }
  ) => {
    const trophy = await prisma.trophy.update({
      where: { id: trophyID },
      data,
      include: { team: true },
    });
    return trophy;
  },

  deleteTrophy: async (trophyID: string) => {
    await prisma.trophy.delete({ where: { id: trophyID } });
    return true;
  },
};
