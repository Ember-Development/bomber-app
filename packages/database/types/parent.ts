import { Prisma } from '../generated/client';

type Relations = {
  user: { user: true };
  address: { address: true };
  children: { children: true };
};

export type ParentDynamic<R extends (keyof Relations)[]> =
  Prisma.ParentGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type AdminFE = ParentDynamic<['user', 'address', 'children']>;
export type AdminDB = ParentDynamic<[]>;
