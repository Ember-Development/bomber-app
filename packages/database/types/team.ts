import type {
  Prisma,
  Team,
  Trophy,
  Player,
  Coach,
  User,
} from '../generated/client';

type Relations = {
  trophyCase: { trophyCase: true };
  players: {
    players: {
      include: {
        user: true;
        commit: { select: { imageUrl: true; name: true } };
      };
    };
  };
  regCoaches: { regCoaches: true };
  coaches: { coaches: { include: { user: true } } };
  headCoach: { headCoach: { include: { user: true } } };
};

export type TeamDynamic<R extends (keyof Relations)[]> = Prisma.TeamGetPayload<{
  include: { [K in R[number]]: true };
}>;

export interface TeamFE extends Team {
  trophyCase: Trophy[];
  teamCode: string;
  players: (Player & {
    user: User | null;
    commit: { imageUrl: string; name: string } | null;
  })[];
  coaches: (Coach & { user: User | null })[];
  headCoach: (Coach & { user: User }) | null;
}

export type TeamDB = TeamDynamic<[]>;
