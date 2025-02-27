import { Prisma } from '../generated/client';

export type Fan = Prisma.FanGetPayload<{
  include: {
    user: true;
  };
}>;

export type FanDB = Prisma.FanGetPayload<Record<string, never>>;
