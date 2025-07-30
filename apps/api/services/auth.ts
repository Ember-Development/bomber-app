import { prisma, UserRole } from '@bomber-app/database';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/crypto';

export const authService = {
  getMockLogin: async () => {
    return await prisma.user.findUnique({
      where: { id: 'b8e7f6fa-2b20-4aaa-bff4-db2c0fa3b0f7' }, // your mock UUID
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
          },
        },
        coach: {
          include: {
            headTeams: true,
            address: true,
            teams: {
              include: {
                players: { include: { user: true } },
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
            children: { include: { team: true, address: true, user: true } },
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
  }: {
    email: string;
    password: string;
    fname: string;
    lname: string;
    role: string;
    phone: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 400, message: 'Email already in use' };

    const passHash = await hashPassword(password);

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
        createData.coach = { create: {} };
        break;
      case 'PLAYER':
        createData.player = { create: {} };
        break;
      case 'PARENT':
        createData.parent = { create: {} };
        break;
      case 'FAN':
        createData.fan = { create: {} };
        break;
    }
    const user = await prisma.user.create({ data: createData });
    const access = signAccess({ sub: user.id, role: user.primaryRole });
    const refresh = signRefresh({ sub: user.id });

    return {
      access,
      refresh,
      user: {
        id: user.id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        phone: user.phone,
        role: user.primaryRole,
      },
    };
  },

  async login({ email, password }: { email: string; password: string }) {
    // 1) Verify credentials as before
    const userMin = await prisma.user.findUnique({ where: { email } });
    if (!userMin) throw { status: 401, message: 'Invalid credentials' };
    const valid = await verifyPassword(password, userMin.pass);
    if (!valid) throw { status: 401, message: 'Invalid credentials' };

    // 2) Generate tokens
    const access = signAccess({ sub: userMin.id, role: userMin.primaryRole });
    const refresh = signRefresh({ sub: userMin.id });

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
    let payload: any;
    try {
      payload = verifyRefresh(token);
    } catch {
      throw { status: 401, message: 'Invalid refresh token' };
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw { status: 401, message: 'User not found' };
    const access = signAccess({ sub: user.id, role: user.primaryRole });
    const refresh = signRefresh({ sub: user.id });
    return { access, refresh };
  },
};
