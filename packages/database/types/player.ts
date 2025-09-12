import { Prisma } from '../generated/client';

type Relations = {
  user: { user: true };
  team: { team: true };
  parents: { parents: true };
  address: { address: true };
  commit: { select: { imageUrl: true; name: true } };
};

export type PlayerDynamic<R extends (keyof Relations)[]> =
  Prisma.PlayerGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type PlayerFE = PlayerDynamic<
  ['user', 'team', 'parents', 'address', 'commit']
>;
export type PlayerDB = PlayerDynamic<[]>;
