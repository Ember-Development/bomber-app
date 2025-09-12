import { Prisma, prisma, User, UserFE } from '@bomber-app/database';
import { updateUser } from '../controllers/userController';
import { hashPassword, verifyPassword } from '../utils/crypto';

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

const pickDefined = <T extends Record<string, any>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;

const hasAnyDefined = (...vals: any[]) => vals.some((v) => v !== undefined);

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
                region: true,
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
                region: true,
              },
            },
          },
        },

        parent: {
          select: {
            children: {
              select: {
                team: {
                  select: {
                    id: true,
                    name: true,
                    region: true,
                  },
                },
              },
            },
          },
        },

        admin: true,
        regCoach: true,
        fan: true,
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
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        player: { include: { address: true } },
        coach: { include: { address: true } },
        parent: { include: { address: true } },
      },
    });

    if (!existingUser) throw new Error('User not found');

    // Normalize top-level scalars (don’t pass undefined; coerce "" -> null for phone)
    const userScalarPatch = pickDefined({
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      phone: data.phone === '' ? null : data.phone,
      primaryRole: data.primaryRole,
    });

    // ----- PLAYER commit (keep your behavior) -----
    const commitMutation =
      typeof data.commitId === 'undefined'
        ? undefined
        : data.commitId === null || data.commitId === ''
          ? { commit: { disconnect: true } }
          : { commit: { connect: { id: String(data.commitId) } } };

    // ----- ADDRESS helpers for each relation -----
    // Request may use a single set of fields for all; that’s how your code is today.
    // If you later split them per role, just map here accordingly.
    const addrFieldsReq = {
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state, // <- IMPORTANT: use the variable value, never `String`
      zip: data.zip,
    };

    const wantAddressChange = hasAnyDefined(
      addrFieldsReq.address1,
      addrFieldsReq.address2,
      addrFieldsReq.city,
      addrFieldsReq.state,
      addrFieldsReq.zip
    );

    // Build nested updates safely:
    // 1) Only include address update if request sent at least one address field.
    // 2) When updating, only send the fields provided (omit undefined).
    // 3) When creating a brand new address (rare), require all required fields.

    // PLAYER nested
    let playerNested: Prisma.UserUpdateInput['player'] | undefined;
    if (existingUser.player) {
      const playerAddressPart = wantAddressChange
        ? existingUser.player.address
          ? {
              address: {
                update: pickDefined({
                  address1: addrFieldsReq.address1,
                  address2: addrFieldsReq.address2,
                  city: addrFieldsReq.city,
                  state: addrFieldsReq.state,
                  zip: addrFieldsReq.zip,
                }),
              },
            }
          : // No address yet: only create if we have all required fields
            (() => {
              const reqOK =
                addrFieldsReq.address1 !== undefined &&
                addrFieldsReq.city !== undefined &&
                addrFieldsReq.state !== undefined &&
                addrFieldsReq.zip !== undefined;
              return reqOK
                ? {
                    address: {
                      create: {
                        address1: String(addrFieldsReq.address1),
                        address2:
                          addrFieldsReq.address2 === undefined
                            ? null
                            : addrFieldsReq.address2,
                        city: String(addrFieldsReq.city),
                        state: String(addrFieldsReq.state),
                        zip: String(addrFieldsReq.zip),
                      },
                    },
                  }
                : {};
            })()
        : undefined;

      // Merge with your other player fields
      const playerOtherPatch = pickDefined({
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
      });

      if (
        (playerAddressPart && Object.keys(playerAddressPart).length > 0) ||
        Object.keys(playerOtherPatch).length > 0 ||
        commitMutation
      ) {
        playerNested = {
          update: {
            ...(playerAddressPart ?? {}),
            ...(playerOtherPatch as any),
            ...(commitMutation ?? {}),
          },
        };
      }
    }

    // COACH nested (address optional on model)
    let coachNested: Prisma.UserUpdateInput['coach'] | undefined;
    if (existingUser.coach) {
      const coachAddressPart = wantAddressChange
        ? existingUser.coach.address
          ? {
              address: {
                update: pickDefined({
                  address1: addrFieldsReq.address1,
                  address2: addrFieldsReq.address2,
                  city: addrFieldsReq.city,
                  state: addrFieldsReq.state,
                  zip: addrFieldsReq.zip,
                }),
              },
            }
          : // Only create if we have all required fields
            (() => {
              const reqOK =
                addrFieldsReq.address1 !== undefined &&
                addrFieldsReq.city !== undefined &&
                addrFieldsReq.state !== undefined &&
                addrFieldsReq.zip !== undefined;
              return reqOK
                ? {
                    address: {
                      create: {
                        address1: String(addrFieldsReq.address1),
                        address2:
                          addrFieldsReq.address2 === undefined
                            ? null
                            : addrFieldsReq.address2,
                        city: String(addrFieldsReq.city),
                        state: String(addrFieldsReq.state),
                        zip: String(addrFieldsReq.zip),
                      },
                    },
                  }
                : {};
            })()
        : undefined;

      if (coachAddressPart && Object.keys(coachAddressPart).length > 0) {
        coachNested = { update: coachAddressPart };
      }
    }

    // PARENT nested (address required on model, but it already exists in your data)
    let parentNested: Prisma.UserUpdateInput['parent'] | undefined;
    if (existingUser.parent) {
      const parentAddressPart = wantAddressChange
        ? existingUser.parent.address
          ? {
              address: {
                update: pickDefined({
                  address1: addrFieldsReq.address1,
                  address2: addrFieldsReq.address2,
                  city: addrFieldsReq.city,
                  state: addrFieldsReq.state,
                  zip: addrFieldsReq.zip,
                }),
              },
            }
          : // If somehow parent has no address (shouldn’t happen by schema), allow create only with all required fields
            (() => {
              const reqOK =
                addrFieldsReq.address1 !== undefined &&
                addrFieldsReq.city !== undefined &&
                addrFieldsReq.state !== undefined &&
                addrFieldsReq.zip !== undefined;
              return reqOK
                ? {
                    address: {
                      create: {
                        address1: String(addrFieldsReq.address1),
                        address2:
                          addrFieldsReq.address2 === undefined
                            ? null
                            : addrFieldsReq.address2,
                        city: String(addrFieldsReq.city),
                        state: String(addrFieldsReq.state),
                        zip: String(addrFieldsReq.zip),
                      },
                    },
                  }
                : {};
            })()
        : undefined;

      if (parentAddressPart && Object.keys(parentAddressPart).length > 0) {
        parentNested = { update: parentAddressPart };
      }
    }

    // Put together final payload
    const payload: Prisma.UserUpdateInput = {
      ...(Object.keys(userScalarPatch).length ? userScalarPatch : {}),
      ...(playerNested ? { player: playerNested } : {}),
      ...(coachNested ? { coach: coachNested } : {}),
      ...(parentNested ? { parent: parentNested } : {}),
    };

    // Safety: if payload ended up empty, avoid sending an empty update
    if (!Object.keys(payload).length) {
      return existingUser; // nothing to change
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: payload,
      include: {
        player: {
          include: {
            address: true,
            team: { select: { id: true, name: true } },
            commit: true,
          },
        },
        coach: {
          include: {
            address: true,
            teams: { select: { id: true, name: true } },
            headTeams: { select: { id: true, name: true } },
          },
        },
        parent: { include: { address: true } },
        regCoach: true,
        admin: true,
      },
    });

    return updated;
  },

  createAddress: async ({
    address1,
    address2,
    city,
    state,
    zip,
  }: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  }) => {
    return prisma.address.create({
      data: {
        address1,
        address2,
        city,
        state,
        zip,
      },
    });
  },

  changePassword: async ({
    userId,
    currentPassword,
    newPassword,
  }: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pass: true },
    });
    if (!user) throw new Error('USER_NOT_FOUND');

    const ok = await verifyPassword(currentPassword, user.pass);
    if (!ok) throw new Error('BAD_CURRENT_PASSWORD');

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { pass: hashed },
    });
  },
};
