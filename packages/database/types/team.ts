import { Prisma } from '../generated/client';

type Relations = {
  trophyCase: { trophyCase: true };
  players: { players: true };
  regCoaches: { regCoaches: true };
  coaches: { coaches: true };
  headCoach: { headCoach: true };
};

export type TeamDynamic<R extends (keyof Relations)[]> = Prisma.TeamGetPayload<{
  include: { [K in R[number]]: true };
}>;

export type Team = TeamDynamic<
  ['trophyCase', 'players', 'regCoaches', 'coaches', 'headCoach']
>;
export type TeamDB = TeamDynamic<[]>;
