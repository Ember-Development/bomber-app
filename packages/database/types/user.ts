import { Prisma } from '../generated/client';

type UserRelations = {
  admin: { admin: true };
  coach: { coach: true };
  regCoach: { regCoach: true };
  player: { player: true };
  parent: { parent: true };
  fan: { fan: true };
  sentMessages: { sentMessages: true };
  chats: { chats: true };
  events: { events: true };
  notifications: { notifications: true };
};

export type UserDynamic<R extends (keyof UserRelations)[]> =
  Prisma.UserGetPayload<{
    include: { [K in R[number]]: true };
  }>;

export type User = UserDynamic<
  [
    'admin',
    'coach',
    'regCoach',
    'player',
    'parent',
    'fan',
    'sentMessages',
    'chats',
    'events',
    'notifications',
  ]
>;

export type UserDB = UserDynamic<[]>;
