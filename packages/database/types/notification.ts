import { Prisma } from '../generated/client';

type Relations = {
  users: { users: true };
};

export type NotificationDynamic<R extends (keyof Relations)[]> =
  Prisma.NotificationGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type NotificationFE = NotificationDynamic<['users']>;
export type NotificationDB = NotificationDynamic<[]>;
