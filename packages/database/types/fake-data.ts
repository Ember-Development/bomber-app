import { PlayerDB, PlayerFE } from './player';
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
  Parent,
} from '/Users/braedon/ember/bomber-app/packages/database/generated/client';
import { faker } from '@faker-js/faker';

export function fakeUserComplete() {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    phone: undefined,
    pass: faker.lorem.words(5),
    fname: faker.lorem.words(5),
    lname: faker.lorem.words(5),
    primaryRole: faker.helpers.arrayElement([
      UserRole.ADMIN,
      UserRole.COACH,
      UserRole.REGIONAL_COACH,
      UserRole.PLAYER,
      UserRole.FAN,
    ] as const),
  };
}
export function fakePlayerComplete(
  teamID: string,
  ageGroup: AgeGroup,
  userID: string | undefined,
  addressID: string | undefined
) {
  let isTrusted = false; //TODO: just set this as default and don't make the field nullable
  let college;

  switch (ageGroup) {
    case 'U8':
    case 'U10':
    case 'U12':
    case 'U14':
    case 'U16':
    case 'U18':
    case 'ALUMNI':
      isTrusted = true;
      college = faker.helpers.fake(['University of {{location.city}}']);
  }
  return {
    id: faker.string.uuid(),
    pos1: faker.helpers.arrayElement([
      Position.PITCHER,
      Position.CATCHER,
      Position.FIRST_BASE,
      Position.SECOND_BASE,
      Position.THIRD_BASE,
      Position.SHORTSTOP,
      Position.LEFT_FIELD,
      Position.CENTER_FIELD,
      Position.RIGHT_FIELD,
      Position.DESIGNATED_HITTER,
    ] as const),
    pos2: faker.helpers.arrayElement([
      Position.PITCHER,
      Position.CATCHER,
      Position.FIRST_BASE,
      Position.SECOND_BASE,
      Position.THIRD_BASE,
      Position.SHORTSTOP,
      Position.LEFT_FIELD,
      Position.CENTER_FIELD,
      Position.RIGHT_FIELD,
      Position.DESIGNATED_HITTER,
    ] as const),
    jerseyNum: faker.lorem.words(5),
    gradYear: faker.lorem.words(5),
    jerseySize: faker.helpers.arrayElement([
      JerseySize.YXS,
      JerseySize.YS,
      JerseySize.YM,
      JerseySize.YL,
      JerseySize.YXL,
      JerseySize.AS,
      JerseySize.AM,
      JerseySize.AL,
      JerseySize.AXL,
      JerseySize.A2XL,
    ] as const),
    pantSize: faker.helpers.arrayElement([
      PantsSize.SIZE_20,
      PantsSize.SIZE_22,
      PantsSize.SIZE_24,
      PantsSize.SIZE_26,
      PantsSize.SIZE_30,
      PantsSize.SIZE_32,
      PantsSize.SIZE_33,
      PantsSize.SIZE_34,
      PantsSize.SIZE_36,
      PantsSize.SIZE_38,
    ] as const),
    stirrupSize: faker.helpers.arrayElement([
      StirrupSize.SM,
      StirrupSize.LG,
      StirrupSize.XL,
    ] as const),
    shortSize: faker.helpers.arrayElement([
      ShortsSize.YXL,
      ShortsSize.ASM,
      ShortsSize.AMD,
      ShortsSize.ALG,
      ShortsSize.AXL,
      ShortsSize.A2XL,
    ] as const),
    practiceShortSize: faker.helpers.arrayElement([
      ShortsSize.YXL,
      ShortsSize.ASM,
      ShortsSize.AMD,
      ShortsSize.ALG,
      ShortsSize.AXL,
      ShortsSize.A2XL,
    ] as const),
    ageGroup,
    userID,
    teamID,
    isTrusted,
    addressID,
    college,
  };
}

// creates a player without agegroup opinionated fields
export const createGenericPlayer = () => {
  return {
    id: faker.string.uuid(),
    pos1: faker.helpers.enumValue(Position),
    pos2: faker.helpers.enumValue(Position),
    jerseyNum: faker.number.int(100).toString(),
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
): PlayerDB {
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
): PlayerDB {
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
): PlayerDB {
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

export function fakeAdminComplete() {
  return {
    id: faker.string.uuid(),
    userID: faker.string.uuid(),
  };
}
export function fakeFanComplete() {
  return {
    id: faker.string.uuid(),
    userID: faker.string.uuid(),
  };
}
export function fakeCoachComplete() {
  return {
    id: faker.string.uuid(),
    userID: faker.string.uuid(),
  };
}
export function fakeRegCoachComplete() {
  return {
    id: faker.string.uuid(),
    userID: faker.string.uuid(),
    region: faker.helpers.arrayElement([
      Regions.NW,
      Regions.SW,
      Regions.S,
      Regions.SE,
      Regions.NE,
      Regions.MW,
    ] as const),
  };
}
export function fakeTeamComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    ageGroup: faker.helpers.arrayElement([
      AgeGroup.U8,
      AgeGroup.U10,
      AgeGroup.U12,
      AgeGroup.U14,
      AgeGroup.U16,
      AgeGroup.U18,
      AgeGroup.ALUMNI,
    ] as const),
    region: faker.helpers.arrayElement([
      Regions.NW,
      Regions.SW,
      Regions.S,
      Regions.SE,
      Regions.NE,
      Regions.MW,
    ] as const),
    headCoachID: faker.string.uuid(),
  };
}
export function fakeTrophyComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    imageURL: faker.lorem.words(5),
    teamID: faker.string.uuid(),
  };
}
export function fakeParentComplete() {
  return {
    id: faker.string.uuid(),
    addressID: faker.string.uuid(),
    userID: faker.string.uuid(),
  };
}
export function fakeAddressComplete() {
  return {
    id: faker.string.uuid(),
    state: faker.lorem.words(5),
    city: faker.lorem.words(5),
    zip: faker.lorem.words(5),
    address1: faker.lorem.words(5),
    address2: undefined,
  };
}
export function fakeChatComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
  };
}
export function fakeUserChatComplete() {
  return {
    userID: faker.string.uuid(),
    chatID: faker.string.uuid(),
    joinedAt: faker.date.anytime(),
  };
}
export function fakeMessageComplete() {
  return {
    id: faker.string.uuid(),
    text: faker.lorem.words(5),
    createdAt: faker.date.anytime(),
    userID: faker.string.uuid(),
    chatID: faker.string.uuid(),
  };
}
export function fakeNotificationComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    body: faker.lorem.words(5),
    createdAt: faker.date.anytime(),
  };
}
export function fakeUserNotificationComplete() {
  return {
    userID: faker.string.uuid(),
    notificationID: faker.string.uuid(),
    isRead: false,
  };
}
export function fakeEventComplete() {
  return {
    id: faker.string.uuid(),
    tournamentID: undefined,
    eventType: faker.helpers.arrayElement([
      EventType.TOURNAMENT,
      EventType.PRACTICE,
      EventType.GLOBAL,
    ] as const),
    start: faker.date.anytime(),
    end: faker.date.anytime(),
  };
}
export function fakeEventAttendanceComplete() {
  return {
    id: faker.string.uuid(),
    userID: faker.string.uuid(),
    eventID: faker.string.uuid(),
    status: AttendanceStatus.PENDING,
  };
}
export function fakeTournamentComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    body: faker.lorem.words(5),
    imageURL: faker.lorem.words(5),
  };
}
