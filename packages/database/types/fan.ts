import { Prisma } from '../generated/client';

type Relations = {
  user: { user: true };
};

export type FanDynamic<R extends (keyof Relations)[]> = Prisma.FanGetPayload<{
  include: { [K in R[number]]: true };
}>;

export type UserFE = FanDynamic<['user']>;

export type UserDB = FanDynamic<[]>;
