import { Prisma } from '../generated/client';

type Relations = {
  user: { user: true };
  team: { team: true };
  parents: { parents: true };
  address: { address: true };
};

export type PlayerDynamic<R extends (keyof Relations)[]> =
  Prisma.PlayerGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type Player = PlayerDynamic<['user', 'team', 'parents', 'address']>;
export type PlayerDB = PlayerDynamic<[]>;
