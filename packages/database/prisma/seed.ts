import { prisma } from '../client';
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
} from '../generated/client';
import { faker } from '@faker-js/faker';
import { UserDB } from '../types/fan';
import { PlayerDB } from '../types/player';
//NOTE: assumptions
/*
 * unhashed passwords (will be handled in auth feature)
 * all users have one role
 * one region (to rule them all!)
 * one child per parent
 *
 */

// const seed = faker.number.int({ min: 1, max: 1_000_000 }); // hardcode this if you want a particular seed
const seed = 459398;

//dont remove, this is used for debugging
console.log(`Using seed: ${seed}`);

faker.seed(seed);
const createAdminUsers = async () => {
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
const createUserFan = async () => {
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

//USERS
const createMockUser = (roles: UserRole[], primaryRole: UserRole) => {
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
const createMockGenericPlayer = () => {
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
const createMock8UTo12UPlayer = (
  teamID: string,
  ageGroup: AgeGroup,
  addressID: string
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
    college: null,
    isTrusted: false,
    addressID,
    teamID,
    ageGroup,
    commitId: null,
  };
};
const createMock14UPlayer = (
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
    faker.number.float() < 0.5
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
    commitId: null,
  };
};
const createMock16UToAlumniPlayer = (
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
    faker.number.float() < 0.5
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
    commitId: null,
  };
};

const createMockParent = (userID: string, addressID: string) => {
  return {
    addressID,
    userID,
  };
};
const createMockAdmin = (userID: string): Omit<Admin, 'id'> => {
  return {
    userID,
  };
};
const createMockFan = (userID: string) => {
  return {
    userID,
  };
};
const createMockCoach = (userID: string) => {
  return {
    userID,
  };
};
const createMockRegCoach = (userID: string, region: Regions) => {
  return {
    userID,
    region,
  };
};

//ROLE DEPENDENT TABLES
const createMockTeam = (
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
const createMockTrophy = (teamID: string) => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
    teamID,
  };
};

const createMockAddress = () => {
  return {
    state: faker.location.state(),
    city: faker.location.city(),
    zip: faker.location.zipCode(),
    address1: `${faker.number.int({ min: 0, max: 9999 })} ${faker.location.street()}`,
    address2:
      faker.number.float() < 0.5
        ? faker.location.secondaryAddress()
        : undefined,
  };
};

//CHATS, MESSAGES, NOTIFICATIONS
const createMockChat = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    createdAt: faker.date.past(),
  };
};
const createMockUserChat = (
  userID: string,
  chatID: string,
  chatCreatedAt: Date
) => {
  return {
    userID,
    chatID,
    joinedAt: faker.date.between({ from: chatCreatedAt, to: Date.now() }),
  };
};
const createMockMessage = (
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
const createMockNotification = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    createdAt: faker.date.recent(),
  };
};
const createMockUserNotification = (userID: string, notificationID: string) => {
  return {
    userID,
    notificationID,
    isRead: faker.datatype.boolean(),
  };
};

//EVENTS
const createMockTournament = () => {
  return {
    title: faker.lorem.words({ min: 1, max: 5 }),
    body: faker.lorem.sentences({ min: 1, max: 5 }),
    imageURL: faker.image.url(),
  };
};
const createMockTournamentEvent = (
  tournamentID: string,
  eventType = EventType.TOURNAMENT
) => {
  const start =
    faker.number.float() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_DAYS = 14;
  const eventDays = faker.number.int({ min: 1, max: MAX_EVENT_DAYS });
  const end = new Date();
  end.setDate(start.getDate() + eventDays);

  return {
    tournamentID,
    eventType,
    start,
    end,
  };
};
const createMockPracticeEvent = (eventType = EventType.PRACTICE) => {
  const start =
    faker.number.float() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_HOURS = 8;
  const eventHours = faker.number.int({ min: 1, max: MAX_EVENT_HOURS });
  const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);

  return {
    tournamentID: undefined,
    eventType,
    start,
    end,
  };
};
const createMockGlobalEvent = (eventType = EventType.GLOBAL) => {
  const start =
    faker.number.float() < 0.5 ? faker.date.soon() : faker.date.recent();

  const MAX_EVENT_HOURS = 8;
  const eventHours = faker.number.int({ min: 1, max: MAX_EVENT_HOURS });
  const end = new Date(start.getTime() + eventHours * 60 * 60 * 1000);

  return {
    tournamentID: undefined,
    eventType,
    start,
    end,
  };
};

const mockDatabase = async (
  minTeams = 0,
  maxTeams = 3,
  minOtherCoaches = 1,
  maxOtherCoaches = 4,
  minPlayersPerTeam = 0,
  maxPlayersPerTeam = 20,
  minTrophiesPerTeam = 0,
  maxTrophiesPerTeam = 20,
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
  minAdmins = 1,
  maxAdmins = 10,
  minFans = 0,
  maxFans = 50,
  minUsersNotified = 10,
  maxUsersNotified = 100,
  minNotificationsPerUser = 1,
  maxNotificationsPerUser = 20,
  ageGroups = Object.values(AgeGroup),
  regions = Object.values(Regions)
) => {
  //clear db
  await prisma.$transaction(async (prisma) => {
    await prisma.userChat.deleteMany(); // Child linking users and chats
    await prisma.message.deleteMany(); // Messages inside chats
    await prisma.chat.deleteMany(); // Parent entity after child records are gone

    await prisma.userNotification.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.regCoach.deleteMany();
    await prisma.fan.deleteMany();

    await prisma.parent.deleteMany();
    await prisma.address.deleteMany();

    await prisma.player.deleteMany();
    await prisma.coach.deleteMany();
    await prisma.admin.deleteMany();

    await prisma.eventAttendance.deleteMany();
    await prisma.user.deleteMany();

    await prisma.event.deleteMany();

    await prisma.trophy.deleteMany();
    await prisma.team.deleteMany();

    await prisma.tournament.deleteMany();
  });

  return await prisma.$transaction(async (prisma) => {
    //TODO: fix this pattern, nothing wrong with it, it's just nasty
    /*
     * take random input min / max
     * generate random num
     * loop
     * mock creation
     * db creation
     * then relational data
     *
     */
    // get nums of team coach + team headCoach relations to generate w/ ageGroups
    const teamsRegion =
      regions[faker.number.int({ min: 0, max: regions.length - 1 })];
    const teamAgeGroup = ageGroups[
      faker.number.int({ min: 0, max: ageGroups.length - 1 })
    ] as AgeGroup;

    //create non-team roles
    const numAdmins = faker.number.int({ min: minAdmins, max: maxAdmins });
    const numFans = faker.number.int({ min: minFans, max: maxFans });
    for (let i = 0; i < numAdmins; i++) {
      createAdminUsers();
    }
    for (let i = 0; i < numFans; i++) {
      createUserFan();
    }
    // create regional coach
    const mockRegCoachUser = createMockUser(
      [UserRole.REGIONAL_COACH],
      UserRole.REGIONAL_COACH
    );

    const regUser = await prisma.user.create({ data: mockRegCoachUser });
    const mockRegCoach = createMockRegCoach(regUser.id, teamsRegion);
    await prisma.regCoach.create({ data: mockRegCoach }); // will relate to team by teamsRegion

    //generate global events
    const numGlobalEvents = faker.number.int({
      min: minGlobalEvents,
      max: maxGlobalEvents,
    });
    for (let i = 0; i < numGlobalEvents; i++) {
      const mockGlobalEvent = createMockGlobalEvent();
      await prisma.event.create({ data: mockGlobalEvent });
    }

    // generate mock teams as center of db population
    const numTeams = faker.number.int({ min: minTeams, max: maxTeams });
    for (let i = 0; i < numTeams; i++) {
      //create team
      const mockTeam = createMockTeam(null, teamAgeGroup, teamsRegion);
      const curTeam = await prisma.team.create({ data: mockTeam });

      const numOtherCoaches = faker.number.int({
        min: minOtherCoaches,
        max: maxOtherCoaches,
      });
      const otherCoaches = [];
      const otherCoachUsers = [];
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
        otherCoachUsers.push(otherUser);
      }

      const numPlayers = faker.number.int({
        min: minPlayersPerTeam,
        max: maxPlayersPerTeam,
      });
      const teamPlayers = [];
      const teamPlayerUsers = [];
      for (let j = 0; j < numPlayers; j++) {
        const mockUser = createMockUser([UserRole.PLAYER], UserRole.PLAYER);
        const numParents = faker.number.int({
          min: minParents,
          max: maxParents,
        });

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
          teamPlayerUsers.push(playerUser);
        } else if (teamAgeGroup == AgeGroup.U14) {
          if (faker.number.float() < 0.5) {
            // isTrusted == true
            //TODO: could simulate a chance that a trusted player still has parent connections...

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

            const parents = [];
            const mockCommonAddress = createMockAddress();
            const commonAddress = await prisma.address.create({
              data: mockCommonAddress,
            });

            for (let k = 0; k < numParents; k++) {
              const mockParentUser = createMockUser(
                [UserRole.PARENT],
                UserRole.PARENT
              );
              const parentUser = await prisma.user.create({
                data: mockParentUser,
              });

              // ~80% chance two parents have same address
              const isNewAddress = faker.number.float() < 0.9;
              let curAddress;
              if (isNewAddress) {
                const mockNewAddress = createMockAddress();
                curAddress = await prisma.address.create({
                  data: mockNewAddress,
                });
              } else {
                curAddress = commonAddress;
              }

              const mockParent = createMockParent(parentUser.id, curAddress.id);
              const newParent = await prisma.parent.create({
                data: mockParent,
              });

              parents.push(newParent);
            }

            const mockPlayer = createMock14UPlayer(
              null,
              curTeam.id,
              parents[0].addressID,
              false,
              teamAgeGroup
            );

            await prisma.player.create({
              data: {
                ...mockPlayer,
                parents: { connect: parents.map((p) => ({ id: p.id })) },
              },
            });
          }
        } else {
          const parents = [];
          const mockCommonAddress = createMockAddress();
          const commonAddress = await prisma.address.create({
            data: mockCommonAddress,
          });
          for (let k = 0; k < numParents; k++) {
            const mockParentUser = createMockUser(
              [UserRole.PARENT],
              UserRole.PARENT
            );
            const parentUser = await prisma.user.create({
              data: mockParentUser,
            });
            // ~80% chance two parents have same address
            const isNewAddress = faker.number.float() < 0.9;
            let curAddress;
            if (isNewAddress) {
              const mockNewAddress = createMockAddress();
              curAddress = await prisma.address.create({
                data: mockNewAddress,
              });
            } else {
              curAddress = commonAddress;
            }

            const mockParent = createMockParent(parentUser.id, curAddress.id);
            const newParent = await prisma.parent.create({
              data: mockParent,
            });

            parents.push(newParent);
          }

          const mockPlayer = createMock8UTo12UPlayer(
            curTeam.id,
            teamAgeGroup,
            parents[0].addressID
          );
          await prisma.player.create({
            data: {
              ...mockPlayer,
              parents: { connect: parents.map((p) => ({ id: p.id })) },
            },
          });
        }
      }

      const numTrophies = faker.number.int({
        min: minTrophiesPerTeam,
        max: maxTrophiesPerTeam,
      });
      for (let j = 0; j < numTrophies; j++) {
        const mockTrophy = createMockTrophy(curTeam.id);
        await prisma.trophy.create({ data: mockTrophy });
      }

      // generate practice events for team
      const numPractices = faker.number.int({
        min: minPracticeEvents,
        max: maxPracticeEvents,
      });
      for (let j = 0; j < numPractices; j++) {
        const mockPracticeEvent = createMockPracticeEvent();
        await prisma.event.create({
          data: mockPracticeEvent,
        });
      }

      // generate tournaments with their events
      const numTournaments = faker.number.int({
        min: minTournaments,
        max: maxTournaments,
      });
      for (let j = 0; j < numTournaments; j++) {
        const numTournamentEvents = faker.number.int({
          min: minTournamentEvents,
          max: maxTournamentEvents,
        });
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
              ...teamPlayerUsers.map((user) => ({
                userID: user.id,
                eventID: tournamentEvent.id,
                status: faker.helpers.enumValue(AttendanceStatus),
              })),
              ...otherCoachUsers.map((user) => ({
                userID: user.id,
                eventID: tournamentEvent.id,
                status: faker.helpers.enumValue(AttendanceStatus),
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
          players: {
            connect: [...teamPlayers.map((p) => ({ id: p.id }))],
          },
        },
      });

      //generate team based chats and messages
      const numTeamChats = faker.number.int({
        min: minTeamChats,
        max: maxTeamChats,
      });
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
                  { regCoach: { region: { equals: curTeam.region } } },
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
        await prisma.userChat.createMany({
          data: teamUsers.map((u) =>
            createMockUserChat(u.id, chat.id, chat.createdAt)
          ),
        });

        // generate messages per user
        for (let j = 0; j < teamUsers.length; j++) {
          const numMessagesPerUser = faker.number.int({
            min: minMessagesPerUser,
            max: maxMessagesPerUser,
          });

          for (let k = 0; k < numMessagesPerUser; k++) {
            const mockMessage = createMockMessage(
              teamUsers[j].id,
              chat.id,
              chat.createdAt
            );
            await prisma.message.create({ data: mockMessage });
          }
        }
      }
    }

    // generate non-team based chats and messages
    // NOTE: it's good to do these after team gen to involve as many users as possible
    const numRandomChats = faker.number.int({
      min: minRandomChats,
      max: maxRandomChats,
    });
    const numUsersRandomChat = faker.number.int({
      min: minUsersRandomChat,
      max: maxUsersRandomChat,
    });
    for (let i = 0; i < numRandomChats; i++) {
      const randomUsers = (await prisma.$queryRaw`
  SELECT * FROM "User" ORDER BY RANDOM() LIMIT ${numUsersRandomChat}
`) as UserDB[];
      const mockChat = createMockChat();
      const chat = await prisma.chat.create({ data: mockChat });
      await prisma.userChat.createMany({
        data: randomUsers.map((u) =>
          createMockUserChat(u.id, chat.id, chat.createdAt)
        ),
      });

      // generate messages per user
      for (let j = 0; j < randomUsers.length; j++) {
        const numMessagesPerUser = faker.number.int({
          min: minMessagesPerUser,
          max: maxMessagesPerUser,
        });

        for (let k = 0; k < numMessagesPerUser; k++) {
          const mockMessage = createMockMessage(
            randomUsers[j].id,
            chat.id,
            chat.createdAt
          );
          await prisma.message.create({ data: mockMessage });
        }
      }
    }

    let numUsersNotified = faker.number.int({
      min: minUsersNotified,
      max: maxUsersNotified,
    });
    const randomUsers = (await prisma.$queryRaw`
                         SELECT * FROM "User" ORDER BY RANDOM() LIMIT ${numUsersNotified}
                         `) as UserDB[];
    numUsersNotified =
      randomUsers.length < numUsersNotified
        ? randomUsers.length
        : numUsersNotified;

    for (let i = 0; i < numUsersNotified; i++) {
      const numNotificationsPerUser = faker.number.int({
        min: minNotificationsPerUser,
        max: maxNotificationsPerUser,
      });
      for (let j = 0; j < numNotificationsPerUser; j++) {
        const mockNotification = createMockNotification();
        const notification = await prisma.notification.create({
          data: mockNotification,
        });
        const mockUserToNotification = createMockUserNotification(
          randomUsers[i].id,
          notification.id
        );

        await prisma.userNotification.create({ data: mockUserToNotification });
      }
    }
  });
};

const main = async () => {
  await mockDatabase();
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
