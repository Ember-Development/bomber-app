import { prisma } from '../client';
import { UserDB } from './fan';
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
    const user: User | null = await prisma.user.create({
      data: mockUser,
    });

    const mockFan = createMockFan(user.id);
    await prisma.fan.create({
      data: mockFan,
    });

    return user;
  });
};

export const mockDatabase = async (
  minTeams = 0,
  maxTeams = 3,
  minOtherCoaches = 1,
  maxOtherCoaches = 4,
  minRegionalCoaches = 1,
  maxRegionalCoaches = 4,
  minPlayersPerTeam = 0,
  maxPlayersPerTeam = 20,
  minParents = 1,
  maxParents = 3,
  minGlobalEvents = 1,
  maxGlobalEvents = 20,
  minPracticeEvents = 1,
  maxPracticeEvents = 20,
  minTournaments = 1,
  maxTournaments = 4,
  minTournamentEvents = 1,
  maxTournamentEvents = 4,
  minRandomChats = 1,
  maxRandomChats = 4,
  minUsersRandomChat = 1,
  maxUsersRandomChat = 20,
  minTeamChats = 1,
  maxTeamChats = 20,
  minMessagesPerUser = 0,
  maxMessagesPerUser = 20,
  ageGroups = Object.values(AgeGroup),
  regions = Object.values(Regions)
) => {
  return await prisma.$transaction(async (prisma) => {
    // get nums of team coach + team headCoach relations to generate w/ ageGroups
    const teamsRegion = regions[Math.floor(Math.random() * regions.length)];
    const teamAgeGroup = ageGroups[
      Math.floor(Math.random() * ageGroups.length)
    ] as AgeGroup;

    //generate global events
    const numGlobalEvents =
      Math.floor(Math.random() * maxGlobalEvents) + minGlobalEvents;
    for (let i = 0; i < numGlobalEvents; i++) {
      const mockGlobalEvent = createMockGlobalEvent();
      await prisma.event.create({ data: mockGlobalEvent });
    }

    // generate mock teams as center of db population
    const numTeams = Math.floor(Math.random() * maxTeams) + minTeams;
    for (let i = 0; i < numTeams; i++) {
      const mockTeam = createMockTeam(null, teamAgeGroup, teamsRegion);
      const curTeam = await prisma.team.create({ data: mockTeam });

      const numOtherCoaches =
        Math.floor(Math.random() * maxOtherCoaches) + minOtherCoaches;
      const otherCoaches = [];
      for (let j = 0; j < numOtherCoaches; j++) {
        const mockOtherCoachUser = createMockUser(
          [UserRole.COACH],
          UserRole.COACH
        );
        const otherUser = await prisma.user.create({
          data: mockOtherCoachUser,
        });
        const mockOtherCoach = createMockCoach(otherUser.id);
        const otherCoach = await prisma.coach.create({ data: mockOtherCoach });
        otherCoaches.push(otherCoach);
      }

      const numRegCoaches =
        Math.floor(Math.random() * maxRegionalCoaches) + minRegionalCoaches;
      const regCoaches = [];
      for (let j = 0; j < numRegCoaches; j++) {
        const mockRegCoachUser = createMockUser(
          [UserRole.REGIONAL_COACH],
          UserRole.REGIONAL_COACH
        );

        const regUser = await prisma.user.create({ data: mockRegCoachUser });
        const mockRegCoach = createMockRegCoach(regUser.id, teamsRegion);
        const regCoach = await prisma.coach.create({ data: mockRegCoach });
        regCoaches.push(regCoach);
      }

      const numPlayers =
        Math.floor(Math.random() * maxPlayersPerTeam) + minPlayersPerTeam;
      const teamPlayers = [];
      for (let j = 0; j < numPlayers; j++) {
        const mockUser = createMockUser([UserRole.PLAYER], UserRole.PLAYER);
        const numParents = Math.floor(Math.random() * maxParents) * minParents;

        // generate players based on age group
        if (
          teamAgeGroup == AgeGroup.ALUMNI ||
          teamAgeGroup == AgeGroup.U18 ||
          teamAgeGroup == AgeGroup.U16
        ) {
          const playerUser = await prisma.user.create({ data: mockUser });
          const mockAddress = createMockAddress();
          const playerAddress = await prisma.address.create({
            data: mockAddress,
          });
          const mockPlayer = createMock16UToAlumniPlayer(
            playerUser.id,
            curTeam.id,
            playerAddress.id,
            teamAgeGroup,
            true
          );

          const newPlayer = await prisma.player.create({
            data: mockPlayer,
          });

          teamPlayers.push(newPlayer);
        } else if (teamAgeGroup == AgeGroup.U14) {
          if (Math.random() < 0.5) {
            // isTrusted == true
            const playerUser = await prisma.user.create({ data: mockUser });
            const mockAddress = createMockAddress();
            const playerAddress = await prisma.address.create({
              data: mockAddress,
            });
            const mockPlayer = createMock14UPlayer(
              playerUser.id,
              curTeam.id,
              playerAddress.id,
              true,
              teamAgeGroup
            );

            const newPlayer = await prisma.player.create({ data: mockPlayer });
            await prisma.user.update({
              where: { id: playerUser.id },
              data: { player: { connect: { id: newPlayer.id } } },
            });
          } else {
            // isTrusted = false
            const mockPlayer = createMock14UPlayer(
              null,
              curTeam.id,
              null,
              false,
              teamAgeGroup
            );

            const parents = [];
            for (let k = 0; k < numParents; k++) {
              const mockParentUser = createMockUser(
                [UserRole.PARENT],
                UserRole.PARENT
              );
              const parentUser = await prisma.user.create({
                data: mockParentUser,
              });
              const mockParentAddress = createMockAddress();
              //TODO: make this a majority chance to just inherit from the player address
              const parentAddress = await prisma.address.create({
                data: mockParentAddress,
              });
              const mockParent = createMockParent(
                parentAddress.id,
                parentUser.id
              );
              const newParent = await prisma.parent.create({
                data: mockParent,
              });

              parents.push(newParent);
            }

            await prisma.player.create({
              data: {
                ...mockPlayer,
                parents: { connect: parents.map((p) => ({ id: p.id })) },
              },
            });
          }
        } else {
          const mockPlayer = createMock8UTo12UPlayer(curTeam.id, teamAgeGroup);

          const parents = [];
          for (let k = 0; k < numParents; k++) {
            const mockParentUser = createMockUser(
              [UserRole.PARENT],
              UserRole.PARENT
            );
            const parentUser = await prisma.user.create({
              data: mockParentUser,
            });
            const mockParentAddress = createMockAddress();
            //TODO: make this a majority chance to just inherit from the player address
            const parentAddress = await prisma.address.create({
              data: mockParentAddress,
            });
            const mockParent = createMockParent(
              parentAddress.id,
              parentUser.id
            );
            const newParent = await prisma.parent.create({
              data: mockParent,
            });

            parents.push(newParent);
          }

          await prisma.player.create({
            data: {
              ...mockPlayer,
              parents: { connect: parents.map((p) => ({ id: p.id })) },
            },
          });
        }
      }

      // generate practice events for team
      const numPractices =
        Math.floor(Math.random() * maxPracticeEvents) + minPracticeEvents;
      for (let j = 0; j < numPractices; j++) {
        const mockPracticeEvent = createMockPracticeEvent();
        await prisma.event.create({
          data: mockPracticeEvent,
        });
      }

      // generate tournaments with their events
      const numTournaments =
        Math.floor(Math.random() * maxTournaments) + minTournaments;
      for (let j = 0; j < numTournaments; j++) {
        const numTournamentEvents =
          Math.floor(Math.random() * maxTournamentEvents) + minTournamentEvents;
        const mockTournament = createMockTournament();
        const tournament = await prisma.tournament.create({
          data: mockTournament,
        });

        for (let k = 0; k < numTournamentEvents; k++) {
          const mockTournamentEvent = createMockTournamentEvent(tournament.id);
          const tournamentEvent = await prisma.event.create({
            data: {
              ...mockTournamentEvent,
            },
          });

          await prisma.eventAttendance.createMany({
            data: [
              ...teamPlayers.map((user) => ({
                userID: user.id,
                eventID: tournamentEvent.id,
                status: AttendanceStatus.PENDING,
              })),
              ...otherCoaches.map((user) => ({
                userID: user.id,
                eventID: tournamentEvent.id,
                status: AttendanceStatus.PENDING,
              })),
              ...regCoaches.map((user) => ({
                userID: user.id,
                eventID: tournamentEvent.id,
                status: AttendanceStatus.PENDING,
              })),
            ],
          });
        }
      }

      await prisma.team.update({
        where: { id: curTeam.id },
        data: {
          ...mockTeam,
          coaches: {
            connect: [...otherCoaches.map((c) => ({ id: c.id }))],
          },
          regCoaches: {
            connect: [...regCoaches.map((c) => ({ id: c.id }))],
          },
          players: {
            connect: [...teamPlayers.map((p) => ({ id: p.id }))],
          },
        },
      });

      //generate team based chats and messages
      const numTeamChats =
        Math.floor(Math.random() * maxTeamChats) + minTeamChats;
      for (let i = 0; i < numTeamChats; i++) {
        const teamUsers = await prisma.user.findMany({
          where: {
            OR: [
              // User is a player on the team
              {
                player: {
                  team: { id: curTeam.id },
                },
              },
              //  User is a coach on the team
              {
                OR: [
                  { coach: { teams: { some: { id: curTeam.id } } } },
                  { regCoach: { teams: { some: { id: curTeam.id } } } },
                ],
              },
              //  User is a parent of a player on the team IF the player is untrusted
              {
                parent: {
                  children: {
                    some: {
                      team: { id: curTeam.id },
                      isTrusted: false,
                    },
                  },
                },
              },
            ],
          },
        });
        const mockChat = createMockChat();
        const chat = await prisma.chat.create({ data: mockChat });

        // generate messages per user
        for (let j = 0; j < teamUsers.length; j++) {
          const numMessagesPerUser =
            Math.floor(Math.random() * maxMessagesPerUser) + minMessagesPerUser;

          for (let k = 0; k < numMessagesPerUser; k++) {
            const mockMessage = createMockMessage(
              teamUsers[i].id,
              chat.id,
              chat.createdAt
            );
            await prisma.message.create({ data: mockMessage });
          }
        }
      }
    }

    // generate non-team based chats and messages
    const numRandomChats =
      Math.floor(Math.random() * maxRandomChats) + minRandomChats;
    const numUsersRandomChat =
      Math.floor(Math.random() * maxUsersRandomChat) + minUsersRandomChat;
    for (let i = 0; i < numRandomChats; i++) {
      const randomUsers = (await prisma.$queryRaw`
  SELECT * FROM "User" ORDER BY RANDOM() LIMIT ${numUsersRandomChat}
`) as UserDB[];
      const mockChat = createMockChat();
      const chat = await prisma.chat.create({ data: mockChat });

      // generate messages per user
      for (let j = 0; j < randomUsers.length; j++) {
        const numMessagesPerUser =
          Math.floor(Math.random() * maxMessagesPerUser) + minMessagesPerUser;

        for (let k = 0; k < numMessagesPerUser; k++) {
          const mockMessage = createMockMessage(
            randomUsers[i].id,
            chat.id,
            chat.createdAt
          );
          await prisma.message.create({ data: mockMessage });
        }
      }
    }
  });
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
  addressID: string | null,
  isTrusted: boolean,
  ageGroup = AgeGroup.U14
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

  const college =
    Math.random() < 0.5
      ? faker.helpers.arrayElement([
          `University of ${faker.location.city()}`,
          `${faker.location.city()} State University`,
        ])
      : null;

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
  isTrusted = true
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

  const college =
    Math.random() < 0.5
      ? faker.helpers.arrayElement([
          `University of ${faker.location.city()}`,
          `${faker.location.city()} State University`,
        ])
      : null;

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
  const end = new Date();
  end.setDate(start.getDate() + eventDays);

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
