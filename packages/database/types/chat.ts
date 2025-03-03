import { Prisma } from '../generated/client';

type Relations = {
  users: { users: true };
  messages: { messages: true };
};

export type ChatDynamic<R extends (keyof Relations)[]> = Prisma.ChatGetPayload<{
  include: { [K in R[number]]: true };
}>;

export type ChatFE = ChatDynamic<['users', 'messages']>;
export type ChatDB = ChatDynamic<[]>;
