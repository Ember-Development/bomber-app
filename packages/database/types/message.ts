import { Prisma, UserRole } from '../generated/client';

type Relations = {
  sender: { sender: true };
  chat: { chat: true };
};

export type MessageDynamic<R extends (keyof Relations)[]> =
  Prisma.MessageGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type MessageFE = MessageDynamic<['sender', 'chat']>;
export type MessageDB = MessageDynamic<[]>;

export type LocalSender = {
  id: string;
  email: string;
  phone: string | null;
  fname: string;
  lname: string;
  pass: string;
  primaryRole: UserRole;
  isDeleted: boolean;
};

export type LocalMessage = Omit<MessageFE, 'sender'> & {
  sender: LocalSender;
};
