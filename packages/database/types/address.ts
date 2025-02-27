import { Prisma } from '../generated/client';

type Relations = {
  players: { players: true };
  parents: { parents: true };
};

export type AddressDynamic<R extends (keyof Relations)[]> =
  Prisma.AddressGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type Address = AddressDynamic<['players', 'parents']>;
export type AddressDB = AddressDynamic<[]>;
