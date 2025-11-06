import type { Prisma } from '../generated/client';

type Relations = {
  players: { players: true };
};

export type CommitDynamic<R extends (keyof Relations)[]> =
  Prisma.CommitGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type CommitFE = CommitDynamic<['players']>;
export type CommitDB = CommitDynamic<[]>;
