import { prisma, User } from '@bomber-app/database';
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
    return await prisma.eventAttendance.findMany({
      where: { userID: userId },
      include: {
        event: {
          include: {
            tournament: true,
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

  updateUser: async (userId: string, data: any) => {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        phone: data.phone,
        ...(data.player && {
          player: {
            update: {
              pos1: data.player.pos1,
              pos2: data.player.pos2,
              jerseyNum: data.player.jerseyNum,
              gradYear: data.player.gradYear,
              college: data.player.college,
              jerseySize: data.player.jerseySize,
              pantSize: data.player.pantSize,
              stirrupSize: data.player.stirrupSize,
              shortSize: data.player.shortSize,
              practiceShortSize: data.player.practiceShortSize,
              ...(data.player.address && {
                address: {
                  update: {
                    address1: data.player.address.address1,
                    address2: data.player.address.address2,
                    city: data.player.address.city,
                    state: data.player.address.state,
                    zip: data.player.address.zip,
                  },
                },
              }),
            },
          },
        }),
      },
      include: { player: { include: { address: true } } },
    });
  },
};
