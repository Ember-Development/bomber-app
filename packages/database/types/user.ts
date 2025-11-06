import type { Prisma } from '../generated/client';

type Relations = {
  admin: { admin: true };
  coach: { coach: true };
  regCoach: { regCoach: true };
  player: { player: { include: { address: true; team: true } } };
  parent: { parent: true };
  fan: { fan: true };
  sentMessages: { sentMessages: true };
  chats: { chats: true };
  events: { events: true };
  notifications: { notifications: true };
};

export type UserDynamic<R extends (keyof Relations)[]> = Prisma.UserGetPayload<{
  include: { [K in R[number]]: true };
}>;

export type UserFE = UserDynamic<
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

export type ChatUser = Pick<UserFE, 'id' | 'fname' | 'lname' | 'primaryRole'>;

// Small version for frontend
export type PublicUserFE = Omit<
  UserFE,
  | 'pass'
  | 'notifications'
  | 'sentMessages'
  | 'events'
  | 'chats'
  | 'admin'
  | 'regCoach'
  | 'parent'
  | 'fan'
> & {
  player?: {
    pos1: string;
    pos2: string;
    ageGroup: string;
    team?: {
      id: string;
      name: string;
      ageGroup: string;
    };
  };
  coach?: {
    teams: {
      id: string;
      name: string;
    }[];
  };
  parent?: {
    children: Array<{
      team?: {
        id: string;
      };
    }>;
  };
};
