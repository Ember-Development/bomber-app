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
} from '/Users/braedon/ember/bomber-app/packages/database/generated/client';
import { faker } from '@faker-js/faker';

//USERS
export const mockUser = (roles: UserRole[], primaryRole: UserRole) => {
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
export const mockGenericPlayer = () => {
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
export const mock8UTo12UPlayer = (
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
    ...createGenericPlayer(),
    userID: null,
    addressID: null,
    college: null,
    isTrusted: false,
    teamID,
    ageGroup,
  };
};
export const mock14UPlayer = (
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
    ...createGenericPlayer(),
    userID,
    teamID,
    addressID,
    isTrusted,
    ageGroup,
    college,
  };
};
export const mock16UToAlumniPlayer = (
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
    ...createGenericPlayer(),
    userID,
    teamID,
    addressID,
    ageGroup,
    isTrusted,
    college,
  };
};

export const mockParent = (userID: string, addressID: string) => {
  return {
    addressID,
    userID,
  };
};
export const mockAdmin = (userID: string) => {
  return {
    userID,
  };
};
export const mockFan = (userID: string) => {
  return {
    userID,
  };
};
export const mockCoach = (userID: string) => {
  return {
    userID,
  };
};
export const mockRegCoach = (userID: string, region: Regions) => {
  return {
    userID,
    region,
  };
};

//ROLE DEPENDENT TABLES
export const mockTeam = (
  headCoachID: string,
  ageGroup: string,
  region: string
) => {
  return {
    name: faker.person.fullName(),
    region,
    ageGroup,
    headCoachID,
  };
};
export const mockTrophy = (teamID: string) => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
    teamID,
  };
};

export const mockAddress = () => {
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
export const mockChat = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    createdAt: faker.date.past(),
  };
};
export const mockUserChat = (userID: string, chatID: string) => {
  return {
    userID,
    chatID,
    //TODO: maybe constrain this
    joinedAt: faker.date.past(),
  };
};
export const mockMessage = (
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
export const mockNotification = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    createdAt: faker.date.recent(),
  };
};
export const mockUserNotification = (
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
export const mockTournamentEvent = (
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
export const mockPracticeEvent = (eventType = EventType.PRACTICE) => {
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
export const mockGlobalEvent = (eventType = EventType.GLOBAL) => {
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

export const mockEvent = (tournamentID: string) => {
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
export const mockEventAttendance = (userID: string, eventID: string) => {
  return {
    userID,
    eventID,
    status: faker.helpers.enumValue(AttendanceStatus),
  };
};
export const mockTournament = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
  };
};
