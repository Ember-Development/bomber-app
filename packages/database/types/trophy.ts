import { Prisma } from '../generated/client';

type Relations = {
  team: { team: true };
};

export type TrophyDynamic<R extends (keyof Relations)[]> =
  Prisma.TrophyGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type TrophyFE = TrophyDynamic<['team']>;
export type TrophyDB = TrophyDynamic<[]>;
