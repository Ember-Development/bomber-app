import type { Prisma } from '../generated/client';

type Relations = {
  user: { user: true };
  teams: { teams: true };
};

export type RegCoachDynamic<R extends (keyof Relations)[]> =
  Prisma.RegCoachGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type RegCoachFE = RegCoachDynamic<['user', 'teams']>;
export type RegCoachDB = RegCoachDynamic<[]>;
