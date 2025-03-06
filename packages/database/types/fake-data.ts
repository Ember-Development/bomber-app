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

export function fakeUser() {
  return {
    email: faker.internet.email(),
    phone: undefined,
    pass: faker.internet.password(),
    fname: faker.person.firstName(),
    lname: faker.person.lastName(),
    primaryRole: faker.helpers.arrayElement([
      UserRole.ADMIN,
      UserRole.COACH,
      UserRole.REGIONAL_COACH,
      UserRole.PLAYER,
      UserRole.FAN,
    ] as const),
  };
}

// creates a player without agegroup opinionated fields
export const createGenericPlayer = () => {
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

export function fake8UTo12UPlayer(
  teamID: string,
  ageGroup: AgeGroup
): Omit<PlayerDB, 'id'> {
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
}

export function fake14UPlayer(
  userID: string | null,
  teamID: string,
  addressID: string,
  isTrusted: boolean,
  ageGroup = AgeGroup.U14,
  college: string | null
): Omit<PlayerDB, 'id'> {
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
}
export function fake16UToAlumniPlayer(
  userID: string,
  teamID: string,
  addressID: string,
  ageGroup: AgeGroup,
  isTrusted = true,
  college: string | null
): Omit<PlayerDB, 'id'> {
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
}
export function fakeAdmin(userID: string) {
  return {
    userID,
  };
}
export function fakeFan(userID: string) {
  return {
    userID,
  };
}
export function fakeCoach(userID: string) {
  return {
    userID,
  };
}
export function fakeRegCoach(userID: string, region: Regions) {
  return {
    userID,
    region,
  };
}
export function fakeTeam(
  headCoachID: string,
  ageGroup: string,
  region: string
) {
  return {
    name: faker.person.fullName(),
    region,
    ageGroup,
    headCoachID,
  };
}
export function fakeTrophy(teamID: string) {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
    teamID,
  };
}
export function fakeParent(userID: string, addressID: string) {
  return {
    addressID,
    userID,
  };
}
export function fakeAddress() {
  return {
    state: faker.location.state(),
    city: faker.location.city(),
    zip: faker.location.zipCode(),
    address1: `${faker.number.int({ min: 0, max: 9999 })} + ${' '}
      ${faker.location.street()}`,
    address2:
      Math.random() < 0.5 ? faker.location.secondaryAddress() : undefined,
  };
}
export function fakeChat() {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    createdAt: faker.date.past(),
  };
}
export function fakeUserChat(userID: string, chatID: string) {
  return {
    userID,
    chatID,
    //TODO: maybe constrain this
    joinedAt: faker.date.past(),
  };
}
export function fakeMessage(userID: string, chatID: string) {
  return {
    text: faker.lorem.sentences({ min: 1, max: 5 }),
    //TODO: make this dependent on chat creation
    createdAt: faker.date.past(),
    userID,
    chatID,
  };
}
export function fakeNotification() {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    createdAt: faker.date.recent(),
  };
}
export function fakeUserNotification(userID: string, notificationID: string) {
  return {
    userID,
    notificationID,
    isRead: faker.datatype.boolean(),
  };
}

export function createTournamentEvent(
  tournamentID: string,
  eventType = EventType.TOURNAMENT
) {
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
}
export function createPracticeEvent(eventType = EventType.PRACTICE) {
  const start = Math.random() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_HOURS = 8;
  const eventHours = Math.floor(Math.random() * MAX_EVENT_HOURS + 1);
  const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);

  return {
    eventType,
    start,
    end,
  };
}
//TODO: enforce attendees in higher order function for global events
export function createGlobalEvent(tournamentID: string) {
  const eventType = faker.helpers.enumValue(EventType);
  const start = Math.random() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_HOURS = 8;
  const eventHours = Math.floor(Math.random() * MAX_EVENT_HOURS + 1);
  const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);

  return {
    tournamentID,
    eventType,
    start,
    end,
  };
}
export function fakeEvent(tournamentID: string) {
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
}
export function fakeEventAttendance(userID: string, eventID: string) {
  return {
    userID,
    eventID,
    status: faker.helpers.enumValue(AttendanceStatus),
  };
}
export function fakeTournament() {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
  };
}
