import { Prisma } from '../generated/client';

type Relations = {
  events: { events: true };
};

export type TournamentDynamic<R extends (keyof Relations)[]> =
  Prisma.TournamentGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type Tournament = TournamentDynamic<['events']>;
export type TournamentDB = TournamentDynamic<[]>;
