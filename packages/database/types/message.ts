import { Prisma } from '../generated/client';

type Relations = {
  sender: { sender: true };
  chat: { chat: true };
};

export type MessageDynamic<R extends (keyof Relations)[]> =
  Prisma.MessageGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type MessageFE = MessageDynamic<['sender', 'chat']> & {
  failedToSend?: boolean;
};
export type MessageDB = MessageDynamic<[]>;
