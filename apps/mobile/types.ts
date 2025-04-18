import { UserRole, AgeGroup, Position } from '@bomber-app/database';

// groups
export type ChatUser = {
  id: string;
  fname: string;
  lname: string;
  primaryRole: UserRole;
};

export interface ChatFE {
  id: string;
  title: string;
  createdAt: string;
  users: {
    id: string;
    fname: string;
    lname: string;
  }[];
}

export interface UserEvent {
  eventID: string;
  id: string;
  status: string;
  userID: string;
  date: string;

  event: {
    start: string;
    end: string;
    eventType: string;
    tournament?: {
      name: string;
      location: string;
    };
  };
}

export interface UserFE {
  id: string;
  fname: string;
  lname: string;
  email: string;
  primaryRole: UserRole;

  player?: {
    pos1: Position;
    pos2: Position;
    ageGroup: AgeGroup;
    team?: {
      id: string;
      name: string;
      ageGroup: AgeGroup;
    };
  };

  coach?: {
    teams: {
      id: string;
      name: string;
    }[];
  };
}

export interface SlimUser {
  id: string;
  fname: string;
  lname: string;
  primaryRole: UserRole;
  player?: {
    pos1: Position;
    pos2: Position;
    ageGroup: AgeGroup;
    team?: {
      name: string;
    };
  };
}

export type UserForGroupModal = SlimUser;
export { UserRole };
