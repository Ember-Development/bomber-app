import { State, AttendanceStatus, EventType, UserRole, Regions, PantsSize, AgeGroup, Position, JerseySize, StirrupSize, ShortsSize } from 'C:\Users\gunna\Desktop\Bomber\bomber-app\packages\database\generated\client';
import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';



export function fakeUser() {
  return {
    email: faker.internet.email(),
    phone: undefined,
    pass: faker.lorem.words(5),
    fname: faker.lorem.words(5),
    lname: faker.lorem.words(5),
    primaryRole: faker.helpers.arrayElement([UserRole.ADMIN, UserRole.COACH, UserRole.REGIONAL_COACH, UserRole.PLAYER, UserRole.PARENT, UserRole.FAN] as const),
  };
}
export function fakeUserComplete() {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    phone: undefined,
    pass: faker.lorem.words(5),
    fname: faker.lorem.words(5),
    lname: faker.lorem.words(5),
    primaryRole: faker.helpers.arrayElement([UserRole.ADMIN, UserRole.COACH, UserRole.REGIONAL_COACH, UserRole.PLAYER, UserRole.PARENT, UserRole.FAN] as const),
    isDeleted: false,
  };
}
export function fakePlayer() {
  return {
    pos1: faker.helpers.arrayElement([Position.PITCHER, Position.CATCHER, Position.FIRST_BASE, Position.SECOND_BASE, Position.THIRD_BASE, Position.SHORTSTOP, Position.LEFT_FIELD, Position.CENTER_FIELD, Position.RIGHT_FIELD, Position.DESIGNATED_HITTER] as const),
    pos2: faker.helpers.arrayElement([Position.PITCHER, Position.CATCHER, Position.FIRST_BASE, Position.SECOND_BASE, Position.THIRD_BASE, Position.SHORTSTOP, Position.LEFT_FIELD, Position.CENTER_FIELD, Position.RIGHT_FIELD, Position.DESIGNATED_HITTER] as const),
    jerseyNum: faker.lorem.words(5),
    gradYear: faker.lorem.words(5),
    jerseySize: faker.helpers.arrayElement([JerseySize.YXS, JerseySize.YS, JerseySize.YM, JerseySize.YL, JerseySize.YXL, JerseySize.AS, JerseySize.AM, JerseySize.AL, JerseySize.AXL, JerseySize.A2XL] as const),
    pantSize: faker.helpers.arrayElement([PantsSize.SIZE_20, PantsSize.SIZE_22, PantsSize.SIZE_24, PantsSize.SIZE_26, PantsSize.SIZE_30, PantsSize.SIZE_32, PantsSize.SIZE_33, PantsSize.SIZE_34, PantsSize.SIZE_36, PantsSize.SIZE_38] as const),
    stirrupSize: faker.helpers.arrayElement([StirrupSize.SM, StirrupSize.LG, StirrupSize.XL] as const),
    shortSize: faker.helpers.arrayElement([ShortsSize.YXL, ShortsSize.ASM, ShortsSize.AMD, ShortsSize.ALG, ShortsSize.AXL, ShortsSize.A2XL] as const),
    practiceShortSize: faker.helpers.arrayElement([ShortsSize.YXL, ShortsSize.ASM, ShortsSize.AMD, ShortsSize.ALG, ShortsSize.AXL, ShortsSize.A2XL] as const),
    ageGroup: faker.helpers.arrayElement([AgeGroup.U8, AgeGroup.U10, AgeGroup.U12, AgeGroup.U14, AgeGroup.U16, AgeGroup.U18, AgeGroup.ALUMNI] as const),
    isTrusted: undefined,
    college: undefined,
  };
}
export function fakePlayerComplete() {
  return {
    id: faker.string.uuid(),
    pos1: faker.helpers.arrayElement([Position.PITCHER, Position.CATCHER, Position.FIRST_BASE, Position.SECOND_BASE, Position.THIRD_BASE, Position.SHORTSTOP, Position.LEFT_FIELD, Position.CENTER_FIELD, Position.RIGHT_FIELD, Position.DESIGNATED_HITTER] as const),
    pos2: faker.helpers.arrayElement([Position.PITCHER, Position.CATCHER, Position.FIRST_BASE, Position.SECOND_BASE, Position.THIRD_BASE, Position.SHORTSTOP, Position.LEFT_FIELD, Position.CENTER_FIELD, Position.RIGHT_FIELD, Position.DESIGNATED_HITTER] as const),
    jerseyNum: faker.lorem.words(5),
    gradYear: faker.lorem.words(5),
    jerseySize: faker.helpers.arrayElement([JerseySize.YXS, JerseySize.YS, JerseySize.YM, JerseySize.YL, JerseySize.YXL, JerseySize.AS, JerseySize.AM, JerseySize.AL, JerseySize.AXL, JerseySize.A2XL] as const),
    pantSize: faker.helpers.arrayElement([PantsSize.SIZE_20, PantsSize.SIZE_22, PantsSize.SIZE_24, PantsSize.SIZE_26, PantsSize.SIZE_30, PantsSize.SIZE_32, PantsSize.SIZE_33, PantsSize.SIZE_34, PantsSize.SIZE_36, PantsSize.SIZE_38] as const),
    stirrupSize: faker.helpers.arrayElement([StirrupSize.SM, StirrupSize.LG, StirrupSize.XL] as const),
    shortSize: faker.helpers.arrayElement([ShortsSize.YXL, ShortsSize.ASM, ShortsSize.AMD, ShortsSize.ALG, ShortsSize.AXL, ShortsSize.A2XL] as const),
    practiceShortSize: faker.helpers.arrayElement([ShortsSize.YXL, ShortsSize.ASM, ShortsSize.AMD, ShortsSize.ALG, ShortsSize.AXL, ShortsSize.A2XL] as const),
    ageGroup: faker.helpers.arrayElement([AgeGroup.U8, AgeGroup.U10, AgeGroup.U12, AgeGroup.U14, AgeGroup.U16, AgeGroup.U18, AgeGroup.ALUMNI] as const),
    userID: undefined,
    teamID: faker.string.uuid(),
    isTrusted: undefined,
    addressID: undefined,
    college: undefined,
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
    addressID: undefined,
  };
}
export function fakeRegCoach() {
  return {
    region: faker.helpers.arrayElement([Regions.NW, Regions.SW, Regions.S, Regions.SE, Regions.NE, Regions.MW] as const),
  };
}
export function fakeRegCoachComplete() {
  return {
    id: faker.string.uuid(),
    userID: faker.string.uuid(),
    region: faker.helpers.arrayElement([Regions.NW, Regions.SW, Regions.S, Regions.SE, Regions.NE, Regions.MW] as const),
  };
}
export function fakeTeam() {
  return {
    name: faker.person.fullName(),
    teamCode: undefined,
    ageGroup: faker.helpers.arrayElement([AgeGroup.U8, AgeGroup.U10, AgeGroup.U12, AgeGroup.U14, AgeGroup.U16, AgeGroup.U18, AgeGroup.ALUMNI] as const),
    region: faker.helpers.arrayElement([Regions.NW, Regions.SW, Regions.S, Regions.SE, Regions.NE, Regions.MW] as const),
  };
}
export function fakeTeamComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    teamCode: undefined,
    ageGroup: faker.helpers.arrayElement([AgeGroup.U8, AgeGroup.U10, AgeGroup.U12, AgeGroup.U14, AgeGroup.U16, AgeGroup.U18, AgeGroup.ALUMNI] as const),
    region: faker.helpers.arrayElement([Regions.NW, Regions.SW, Regions.S, Regions.SE, Regions.NE, Regions.MW] as const),
    state: State.TX,
    headCoachID: undefined,
  };
}
export function fakeTrophy() {
  return {
    title: faker.lorem.words(5),
    imageURL: faker.lorem.words(5),
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
export function fakeAddress() {
  return {
    state: faker.lorem.words(5),
    city: faker.lorem.words(5),
    zip: faker.lorem.words(5),
    address1: faker.lorem.words(5),
    address2: undefined,
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
export function fakeChat() {
  return {
    title: faker.lorem.words(5),
    createdAt: faker.date.anytime(),
  };
}
export function fakeChatComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    createdAt: faker.date.anytime(),
    lastMessageAt: new Date(),
  };
}
export function fakeUserChat() {
  return {
    joinedAt: faker.date.anytime(),
  };
}
export function fakeUserChatComplete() {
  return {
    userID: faker.string.uuid(),
    chatID: faker.string.uuid(),
    joinedAt: faker.date.anytime(),
  };
}
export function fakeMessage() {
  return {
    text: faker.lorem.words(5),
    createdAt: faker.date.anytime(),
  };
}
export function fakeMessageComplete() {
  return {
    id: faker.string.uuid(),
    text: faker.lorem.words(5),
    createdAt: faker.date.anytime(),
    retryCount: 0,
    failedToSend: false,
    userID: faker.string.uuid(),
    chatID: faker.string.uuid(),
  };
}
export function fakeNotification() {
  return {
    title: faker.lorem.words(5),
    body: faker.lorem.words(5),
    createdAt: faker.date.anytime(),
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
export function fakeEvent() {
  return {
    eventType: faker.helpers.arrayElement([EventType.TOURNAMENT, EventType.PRACTICE, EventType.GLOBAL] as const),
    start: faker.date.anytime(),
    end: faker.date.anytime(),
  };
}
export function fakeEventComplete() {
  return {
    id: faker.string.uuid(),
    tournamentID: undefined,
    eventType: faker.helpers.arrayElement([EventType.TOURNAMENT, EventType.PRACTICE, EventType.GLOBAL] as const),
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
export function fakeTournament() {
  return {
    title: faker.lorem.words(5),
    body: faker.lorem.words(5),
    imageURL: faker.lorem.words(5),
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
export function fakeSponsor() {
  return {
    title: faker.lorem.words(5),
    url: faker.lorem.words(5),
    logoUrl: faker.lorem.words(5),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeSponsorComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    url: faker.lorem.words(5),
    logoUrl: faker.lorem.words(5),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeBanner() {
  return {
    imageUrl: faker.lorem.words(5),
    duration: faker.number.int(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeBannerComplete() {
  return {
    id: faker.string.uuid(),
    imageUrl: faker.lorem.words(5),
    duration: faker.number.int(),
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeMedia() {
  return {
    title: faker.lorem.words(5),
    videoUrl: faker.lorem.words(5),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeMediaComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    videoUrl: faker.lorem.words(5),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeArticle() {
  return {
    title: faker.lorem.words(5),
    body: faker.lorem.words(5),
    link: undefined,
    imageUrl: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeArticleComplete() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(5),
    body: faker.lorem.words(5),
    link: undefined,
    imageUrl: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
