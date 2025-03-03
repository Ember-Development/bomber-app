import { Prisma } from '../generated/client';

type Relations = {
  user: { user: true };
};

export type AdminDynamic<R extends (keyof Relations)[]> =
  Prisma.AdminGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type AdminFE = AdminDynamic<['user']>;
export type AdminDB = AdminDynamic<[]>;
