import { Prisma } from '../generated/client';

type Relations = {
  sender: { sender: true };
  chat: { chat: true };
};

export type MessageDynamic<R extends (keyof Relations)[]> =
  Prisma.MessageGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type Message = MessageDynamic<['sender', 'chat']>;
export type MessageDB = MessageDynamic<[]>;
