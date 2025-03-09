import { prisma } from '../client';
import { PlayerDB } from './player';
import {
  AttendanceStatus,
  EventType,
  UserRole,
  Regions,
  PantsSize,
  AgeGroup,
  Position,
  JerseySize,
  StirrupSize,
  ShortsSize,
  Admin,
  User,
} from '/Users/braedon/ember/bomber-app/packages/database/generated/client';
import { faker } from '@faker-js/faker';

export const createUserAdmin = async () => {
  //TODO: fill array with random other roles... think of how to do this... is there a faker native way to take advantage of seeding?
  const mockUser = createMockUser([UserRole.ADMIN], UserRole.ADMIN);

  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.create({
      data: { ...mockUser },
    });

    const mockAdmin = createMockAdmin(user.id);
    const admin = await prisma.admin.create({
      data: mockAdmin,
    });

    return admin;
  });
};
export const createUserFan = async () => {
  const mockUser = createMockUser([UserRole.FAN], UserRole.FAN);

  return await prisma.$transaction(async (prisma) => {
    let user: User | null = await prisma.user.create({
      data: mockUser,
    });

    const mockFan = createMockFan(user.id);
    await prisma.fan.create({
      data: mockFan,
    });

    user = await prisma.user.findUnique({ where: { id: user.id } });

    return user;
  });
};

export const createUserCoach = async (
  minHeadCoach = 1,
  minTeams = 0,
  maxTeams = 3,
  minPlayersPerTeam = 0,
  maxPlayersPerTeam = 20,
  ageGroups = Object.values(AgeGroup),
  regions = Object.values(Regions)
) => {
  const mockUser = createMockUser([UserRole.COACH], UserRole.COACH);

  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.create({ data: mockUser });

    const mockCoach = createMockCoach(user.id);
    const coach = await prisma.coach.create({ data: mockCoach });

    // get nums of team coach + team headCoach relations to generate w/ ageGroups
    const numTeams = Math.floor(Math.random() * maxTeams) + minTeams;
    const numHeadCoach = Math.floor(Math.random() * maxTeams) + minHeadCoach;
    const teamsRegion = regions[Math.floor(Math.random() * regions.length)];
    const teamAgeGroup = ageGroups[
      Math.floor(Math.random() * ageGroups.length)
    ] as AgeGroup;

    // generate mock teams
    const teams = [];

    for (let i = 0; i < numTeams; i++) {
      const mockTeam = createMockTeam(
        i < numHeadCoach ? coach.id : null,
        teamAgeGroup,
        teamsRegion
      );
      teams.push(mockTeam);
    }

    // TODO: generate other coaches for the team
    // for (let i = 0; i < numTeams; i++) {}

    for (let i = 0; i < numTeams; i++) {
      await prisma.team.create({ data: teams[i] });

      const numPlayers =
        Math.floor(Math.random() * maxPlayersPerTeam) + minPlayersPerTeam;
      // const teamPlayers = [];
      for (let j = 0; j < numPlayers; j++) {
        // let mockPlayer;
        //TODO: create util that breaks down these common groups
        if (
          teamAgeGroup == AgeGroup.ALUMNI ||
          teamAgeGroup == AgeGroup.U18 ||
          teamAgeGroup == AgeGroup.U16
        ) {
          // mockUser = createUserPlayer()
          // mockPlayer = createMock16UToAlumniPlayer()
        } else if (teamAgeGroup == AgeGroup.U14) {
          // mockUser = createUserPlayer()
          // mockPlayer = createMock14UPlayer()
        } else {
          // mockPlayer = createMock8UTo12UPlayer()
        }
      }

      //TODO: generate players with age group related to team
    }

    return user;
  });
};
export const createTeamFromCoach = async () => {
  //TODO: generate players with age group from the team
  //TODO: if players are untrusted then create parents with user accounts
  //TODO: if players are trusted then create user accounts for the players
  //TODO: create trophy case for team
};

//USERS
export const createMockUser = (roles: UserRole[], primaryRole: UserRole) => {
  // this should never trigger but just in case
  if (roles.length < 1) {
    throw new Error('Every user should have at least one role');
  }

  let phone = undefined;
  if (
    roles.some((role) =>
      ([UserRole.COACH, UserRole.REGIONAL_COACH] as UserRole[]).includes(role)
    )
  ) {
    phone = faker.phone.number();
  }

  return {
    phone,
    primaryRole,
    email: faker.internet.email(),
    pass: faker.internet.password(),
    fname: faker.person.firstName(),
    lname: faker.person.lastName(),
  };
};

//USER ROLES
export const createMockGenericPlayer = () => {
  return {
    pos1: faker.helpers.enumValue(Position),
    pos2: faker.helpers.enumValue(Position),
    jerseyNum: faker.string.numeric(2),
    gradYear: faker.date.future({ years: 10 }).getFullYear().toString(),
    jerseySize: faker.helpers.enumValue(JerseySize),
    pantSize: faker.helpers.enumValue(PantsSize),
    stirrupSize: faker.helpers.enumValue(StirrupSize),
    shortSize: faker.helpers.enumValue(ShortsSize),
    practiceShortSize: faker.helpers.enumValue(ShortsSize),
  };
};
export const createMock8UTo12UPlayer = (
  teamID: string,
  ageGroup: AgeGroup
): Omit<PlayerDB, 'id'> => {
  //This should never get triggered but just in case
  if (
    ageGroup != AgeGroup.U8 &&
    ageGroup != AgeGroup.U10 &&
    ageGroup != AgeGroup.U12
  )
    throw new Error('Error generating 8U to 12U player: wrong age group');

  return {
    ...createMockGenericPlayer(),
    userID: null,
    addressID: null,
    college: null,
    isTrusted: false,
    teamID,
    ageGroup,
  };
};
export const createMock14UPlayer = (
  userID: string | null,
  teamID: string,
  addressID: string,
  isTrusted: boolean,
  ageGroup = AgeGroup.U14,
  college: string | null
): Omit<PlayerDB, 'id'> => {
  //This should never get triggered but just in case
  if (userID && !isTrusted) {
    throw new Error(
      'Error generating 14U player: untrusted player was given a user relation'
    );
  } else if (!userID && isTrusted) {
    throw new Error(
      'Error generating 14U player: trusted player was not given a user relation'
    );
  }

  return {
    ...createMockGenericPlayer(),
    userID,
    teamID,
    addressID,
    isTrusted,
    ageGroup,
    college,
  };
};
export const createMock16UToAlumniPlayer = (
  userID: string,
  teamID: string,
  addressID: string,
  ageGroup: AgeGroup,
  isTrusted = true,
  college: string | null
): Omit<PlayerDB, 'id'> => {
  //This should never get triggered but just in case
  if (
    ageGroup !== AgeGroup.U16 &&
    ageGroup !== AgeGroup.U18 &&
    ageGroup !== AgeGroup.ALUMNI
  )
    throw new Error(
      'Error generating user between 16U and ALUMNI, wrong AgeGroup'
    );
  return {
    ...createMockGenericPlayer(),
    userID,
    teamID,
    addressID,
    ageGroup,
    isTrusted,
    college,
  };
};

export const createMockParent = (userID: string, addressID: string) => {
  return {
    addressID,
    userID,
  };
};
export const createMockAdmin = (userID: string): Omit<Admin, 'id'> => {
  return {
    userID,
  };
};
export const createMockFan = (userID: string) => {
  return {
    userID,
  };
};
export const createMockCoach = (userID: string) => {
  return {
    userID,
  };
};
export const createMockRegCoach = (userID: string, region: Regions) => {
  return {
    userID,
    region,
  };
};

//ROLE DEPENDENT TABLES
export const createMockTeam = (
  headCoachID: string | null,
  ageGroup: AgeGroup,
  region: Regions
) => {
  return {
    name: faker.word.adjective() + ' ' + faker.animal.type() + 's', // assuming correct plural is adding an 's', if not it'll at least be funny
    region,
    ageGroup,
    headCoachID,
  };
};
export const createMockTrophy = (teamID: string) => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
    teamID,
  };
};

export const createMockAddress = () => {
  return {
    state: faker.location.state(),
    city: faker.location.city(),
    zip: faker.location.zipCode(),
    address1: `${faker.number.int({ min: 0, max: 9999 })} + ${' '}
      ${faker.location.street()}`,
    address2:
      Math.random() < 0.5 ? faker.location.secondaryAddress() : undefined,
  };
};

//CHATS, MESSAGES, NOTIFICATIONS
export const createMockChat = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    createdAt: faker.date.past(),
  };
};
export const createMockUserChat = (userID: string, chatID: string) => {
  return {
    userID,
    chatID,
    //TODO: maybe constrain this
    joinedAt: faker.date.past(),
  };
};
export const createMockMessage = (
  userID: string,
  chatID: string,
  chatCreationDate: Date
) => {
  return {
    text: faker.lorem.sentences({ min: 1, max: 5 }),
    createdAt: faker.date.between({ from: chatCreationDate, to: Date.now() }),
    userID,
    chatID,
  };
};
export const createMockNotification = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    createdAt: faker.date.recent(),
  };
};
export const createMockUserNotification = (
  userID: string,
  notificationID: string
) => {
  return {
    userID,
    notificationID,
    isRead: faker.datatype.boolean(),
  };
};

//EVENTS
export const createMockTournamentEvent = (
  tournamentID: string,
  eventType = EventType.TOURNAMENT
) => {
  const start = Math.random() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_DAYS = 14;
  const eventDays = Math.floor(Math.random() * MAX_EVENT_DAYS + 1);
  const end = new Date().setDate(start.getDate() + eventDays);

  return {
    tournamentID,
    eventType,
    start,
    end,
  };
};
export const createMockPracticeEvent = (eventType = EventType.PRACTICE) => {
  const start = Math.random() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_HOURS = 8;
  const eventHours = Math.floor(Math.random() * MAX_EVENT_HOURS + 1);
  const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);

  return {
    tournamentID: undefined,
    eventType,
    start,
    end,
  };
};
export const createMockGlobalEvent = (eventType = EventType.GLOBAL) => {
  const start = Math.random() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_HOURS = 8;
  const eventHours = Math.floor(Math.random() * MAX_EVENT_HOURS + 1);
  const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);

  return {
    tournamentID: undefined,
    eventType,
    start,
    end,
  };
};

export const createMockEvent = (tournamentID: string) => {
  const eventType = faker.helpers.enumValue(EventType);
  const start = Math.random() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_DAYS = 14;
  const MAX_EVENT_HOURS = 8;
  const eventDays = Math.floor(Math.random() * MAX_EVENT_DAYS + 1);
  const eventHours = Math.floor(Math.random() * MAX_EVENT_HOURS + 1);
  let end;

  switch (eventType) {
    case 'TOURNAMENT':
      end = new Date().setDate(start.getDate() + eventDays);
      break;
    case 'PRACTICE':
      end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);
      break;
    case 'GLOBAL':
      end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);
      //TODO: how to enforce attendees
      break;
  }

  return {
    tournamentID,
    eventType,
    start,
    end,
  };
};
export const createMockEventAttendance = (userID: string, eventID: string) => {
  return {
    userID,
    eventID,
    status: faker.helpers.enumValue(AttendanceStatus),
  };
};
export const createMockTournament = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
  };
};
