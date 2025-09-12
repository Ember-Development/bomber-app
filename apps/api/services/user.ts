import { Prisma, prisma, User, UserFE } from '@bomber-app/database';
import { updateUser } from '../controllers/userController';

//FIXME: replace the any once we have full types
const validateUser = (user: any) => {
  const userHasRoleOtherThanPlayer =
    user.adminID || user.coachID || user.regCoachID || user.parentID;

  //TODO: figure out how to eval this quickly... worst case make query
  let userIsPlayer = true;
  let playerAgeGroup = '8u'; //TODO: use the enums when types are defined

  const userIs14PlusPlayer =
    userIsPlayer &&
    (playerAgeGroup === '14u' ||
      playerAgeGroup === '16u' ||
      playerAgeGroup === '18u' ||
      playerAgeGroup === 'alumni');

  const errors = [];

  if (!user.phone) {
    if (userHasRoleOtherThanPlayer)
      errors.push('User roles other than players must have phone number');
  }
  if (!user.email) {
    if (userHasRoleOtherThanPlayer)
      errors.push('User roles other than players must have an email for login');
    else if (userIs14PlusPlayer)
      errors.push('Players 14 and up require an email for login');
  }
  if (!user.pass)
    if (userHasRoleOtherThanPlayer)
      errors.push(
        'User roles other than players must have a password for login'
      );
    else if (userIs14PlusPlayer)
      errors.push('Players 14 and up require a password for login');

  if (errors.length > 0) return errors;
};

export { validateUser };

export interface CreateUserInput {
  email: string;
  pass: string;
  fname: string;
  lname: string;
  phone?: string;
  primaryRole: Prisma.UserCreateInput['primaryRole'];
  adminID?: string;
  coachID?: string;
  regCoachID?: string;
  playerID?: string;
  parentID?: string;
  fanID?: string;
}

export const userService = {
  getAllUsers: async () => {
    return await prisma.user.findMany({
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        primaryRole: true,

        player: {
          select: {
            pos1: true,
            pos2: true,
            ageGroup: true,
            team: {
              select: {
                id: true,
                name: true,
                ageGroup: true,
              },
            },
          },
        },

        coach: {
          select: {
            teams: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  getUsersByChatId: async (chatId: string) => {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                fname: true,
                lname: true,
                primaryRole: true,
              },
            },
          },
        },
      },
    });

    return (chat?.users || [])
      .map((userChat) => userChat.user)
      .filter((u) => u !== null);
  },

  getUserEvents: async (userId: string) => {
    return await prisma.event.findMany({
      where: {
        attendees: {
          some: {
            userID: userId,
          },
        },
      },
      include: {
        tournament: true,
        attendees: {
          include: {
            user: {
              select: {
                fname: true,
                lname: true,
                primaryRole: true,
              },
            },
          },
        },
      },
    });
  },

  getUserChats: async (userId: string) => {
    return await prisma.chat.findMany({
      where: {
        users: {
          some: { userID: userId },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                fname: true,
                lname: true,
                primaryRole: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  createUser: async (data: CreateUserInput): Promise<UserFE> => {
    return prisma.user.create({
      data: {
        email: data.email,
        pass: data.pass,
        fname: data.fname,
        lname: data.lname,
        phone: data.phone,
        primaryRole: data.primaryRole,
        admin: data.adminID ? { connect: { id: data.adminID } } : undefined,
        coach: data.coachID ? { connect: { id: data.coachID } } : undefined,
        regCoach: data.regCoachID
          ? { connect: { id: data.regCoachID } }
          : undefined,
        player: data.playerID ? { connect: { id: data.playerID } } : undefined,
        parent: data.parentID ? { connect: { id: data.parentID } } : undefined,
        fan: data.fanID ? { connect: { id: data.fanID } } : undefined,
      },
      include: {
        admin: true,
        coach: true,
        regCoach: true,
        player: true,
        parent: true,
        fan: true,
        notifications: true,
        sentMessages: true,
        chats: true,
        events: true,
      },
    });
  },

  softDeleteUser: async (id: string): Promise<UserFE> => {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
      include: {
        admin: true,
        coach: true,
        regCoach: true,
        player: true,
        parent: true,
        fan: true,
        notifications: true,
        sentMessages: true,
        chats: true,
        events: true,
      },
    });
  },

  updateUser: async (userId: string, data: any) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        phone: data.phone,
        player: {
          update: {
            pos1: data.pos1,
            pos2: data.pos2,
            jerseyNum: data.jerseyNum,
            gradYear: data.gradYear,
            college: data.college,
            jerseySize: data.jerseySize,
            pantSize: data.pantSize,
            stirrupSize: data.stirrupSize,
            shortSize: data.shortSize,
            practiceShortSize: data.practiceShortSize,
            address: {
              update: {
                address1: data.address1,
                address2: data.address2,
                city: data.city,
                state: data.state,
                zip: data.zip,
              },
            },
          },
        },
      },
      include: { player: { include: { address: true } } },
    });
  },
};
