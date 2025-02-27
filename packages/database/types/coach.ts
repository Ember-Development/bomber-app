import { Prisma } from '../generated/client';

type Relations = {
  user: { user: true };
  headTeams: { headTeams: true };
  teams: { teams: true };
};

export type CoachDynamic<R extends (keyof Relations)[]> =
  Prisma.CoachGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type AdminFE = CoachDynamic<['user', 'headTeams', 'teams']>;
export type AdminDB = CoachDynamic<[]>;
