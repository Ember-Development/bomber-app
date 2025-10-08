import { PlayerFE } from '@bomber-app/database';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { issueTokenPair, rotateRefreshToken } from '../auth/token';
import { prisma } from '../api';
import { UserRole } from '@bomber-app/database/generated/client';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: '26f9c1a1-efab-499a-9a97-06022a489647' },
      include: {
        player: {
          include: {
            team: {
              include: {
                headCoach: true,
                players: true,
                coaches: true,
                trophyCase: true,
              },
            },
            parents: true,
            address: true,
          },
        },
        coach: {
          include: {
            headTeams: true,
            address: true,
            teams: {
              include: {
                players: {
                  include: { user: true },
                },
                coaches: {
                  include: { user: true },
                },
                trophyCase: true,
                headCoach: true,
              },
            },
          },
        },
        regCoach: true,
        parent: {
          include: {
            children: {
              include: {
                team: true,
                address: true,
                user: true,
              },
            },
            address: true,
          },
        },
        admin: true,
        fan: true,
      },
    });
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        player: {
          include: {
            team: {
              include: {
                headCoach: true,
                players: true,
                coaches: true,
                trophyCase: true,
              },
            },
            parents: true,
            address: true,
            commit: { select: { imageUrl: true, name: true } },
          },
        },
        coach: {
          include: {
            headTeams: true,
            address: true,
            teams: {
              include: {
                players: {
                  include: {
                    user: true,
                    commit: { select: { imageUrl: true, name: true } },
                  },
                },
                coaches: { include: { user: true } },
                trophyCase: true,
                headCoach: true,
              },
            },
          },
        },
        regCoach: true,
        parent: {
          include: {
            children: {
              include: {
                team: true,
                address: true,
                user: true,
                commit: { select: { imageUrl: true, name: true } },
              },
            },
            address: true,
          },
        },
        admin: true,
        fan: true,
      },
    });
  },

  async signUpBase({
    email,
    password,
    fname,
    lname,
    role,
    phone,
    player,
    coach,
    parent, // expect: { id: string } when connecting a player to an existing parent
  }: {
    email: string;
    password: string;
    fname: string;
    lname: string;
    role: string;
    phone: string;
    player?: any;
    coach?: any;
    parent?: any;
  }) {
    // 1) Prevent duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 400, message: 'Email already in use' };

    // 2) Hash password
    const passHash = await hashPassword(password);

    // 3) Build the create payload
    const createData: any = {
      email,
      pass: passHash,
      fname,
      lname,
      phone,
      primaryRole: role as UserRole,
    };

    switch (role) {
      case 'COACH':
        createData.coach = {
          create: {
            ...(coach?.addressID && {
              address: { connect: { id: coach.addressID } },
            }),
            ...(coach?.teamCode && {
              teams: { connect: { teamCode: coach.teamCode } },
            }),
          },
        };
        // **if** the client also passed `parent: { addressID }`, nest-create that too
        if (parent) {
          createData.parent = {
            create: {
              ...(parent.addressID && {
                address: { connect: { id: parent.addressID } },
              }),
            },
          };
        }
        break;

      case 'PLAYER':
        if (!player?.pos1 || !player?.jerseyNum || !player?.gradYear) {
          throw { status: 400, message: 'Missing required player fields' };
        }
        createData.player = {
          create: {
            ...player,
            // if `parent.id` was passed in, connect it:
            ...(parent?.id && { parents: { connect: { id: parent.id } } }),
          },
        };
        break;

      case 'PARENT':
        createData.parent = {
          create: {
            ...(parent?.addressID && {
              address: { connect: { id: parent.addressID } },
            }),
          },
        };
        break;

      case 'FAN':
        createData.fan = { create: {} };
        break;
    }

    // 4) Create the User (and nested coach/player/parent/fan)
    const user = await prisma.user.create({ data: createData });

    // 5) Issue tokens
    const access = signAccess({ sub: user.id, role: user.primaryRole });
    const refresh = signRefresh({ sub: user.id });

    // 6) Fetch the newly created profile
    const fullProfile = await this.getUserById(user.id);

    // 7) If we just added a PLAYER and connected to an existing parent, fetch the updated parent
    let updatedParent = null;
    if (role === 'PLAYER' && parent?.id) {
      updatedParent = await prisma.parent.findUnique({
        where: { id: parent.id },
        include: {
          user: true,
          address: true,
          children: {
            include: {
              user: true,
              team: true,
              address: true,
            },
          },
        },
      });
    }

    // 8) Return everything
    return {
      access,
      refresh,
      user: fullProfile,
      parent: updatedParent, // will be null for non-player signups
    };
  },

  async login({ email, password }: { email: string; password: string }) {
    // 1) Verify credentials as before
    const userMin = await prisma.user.findUnique({ where: { email } });
    if (!userMin) throw { status: 401, message: 'Invalid credentials' };
    const valid = await verifyPassword(password, userMin.pass);
    if (!valid) throw { status: 401, message: 'Invalid Password' };

    // 2) Generate tokens
    const { access, refresh } = await issueTokenPair({
      id: userMin.id,
      role: userMin.primaryRole,
    });

    // 3) Fetch the full, nested profile
    const fullProfile = await this.getUserById(userMin.id);
    if (!fullProfile) throw { status: 404, message: 'User not found' };

    // 4) Return tokens + full profile
    return {
      access,
      refresh,
      user: fullProfile,
    };
  },

  async refreshToken(token: string) {
    // rotate: revoke matched stored token, return new pair
    const { access, refresh } = await rotateRefreshToken(token);
    return { access, refresh };
  },
};
