import { UserRole, AgeGroup, Position } from '@bomber-app/database';

// groups
export type ChatUser = {
  id: string;
  fname: string;
  lname: string;
  primaryRole: UserRole;
};

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

export { UserRole };
