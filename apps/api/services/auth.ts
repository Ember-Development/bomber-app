import { PlayerFE } from '@bomber-app/database';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { issueTokenPair, rotateRefreshToken } from '../auth/token';
import { prisma } from '../api';
import { UserRole } from '@bomber-app/database/generated/client';
import { isEmail, nonEmptyString } from '../utils/validators.js';
import { maskEmail, hashEmail } from '../utils/log';
import { sendPasswordResetEmail } from '../utils/email';
import { signResetToken, verifyResetToken } from '../utils/passwordReset';

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

  async requestPasswordReset(emailUnknown: unknown) {
    if (!isEmail(emailUnknown)) {
      console.warn('[forgot] invalid email format', {
        email: maskEmail(String(emailUnknown)),
      });
      return;
    }

    const email = String(emailUnknown).trim().toLowerCase();
    console.log('[forgot] normalized', {
      emailMasked: maskEmail(email),
      emailHash: hashEmail(email),
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.email || !user.pass) {
      console.log('[forgot] no user found', { emailHash: hashEmail(email) });
      return; // uniform 200
    }
    console.log('[forgot] user found', { userId: user.id });

    const token = signResetToken(user.id, user.email, user.pass, '15m');
    console.log('[forgot] token minted', { len: token.length });

    try {
      const id = await sendPasswordResetEmail({
        to: user.email,
        email: user.email,
        token,
      });
      console.log('[forgot] email handed to Resend', { messageId: id });
    } catch (e: any) {
      console.error('[forgot] send failed', {
        name: e?.name,
        message: e?.message,
        statusCode: e?.statusCode,
        cause: e?.cause,
      });
    }
  },

  async resetPassword(body: any) {
    console.log('[reset] service start');

    const email = body?.email;
    const token = body?.token;
    const password = body?.password;

    console.log('[reset] extracted values', {
      emailMasked: maskEmail(email),
      hasToken: Boolean(token),
      tokenLength: token?.length,
      hasPassword: Boolean(password),
    });

    console.log('[reset] checking isEmail function', {
      isEmailDefined: typeof isEmail !== 'undefined',
      isEmailType: typeof isEmail,
    });

    if (!isEmail(email)) {
      console.log('[reset] email validation failed', {
        emailMasked: maskEmail(email),
      });
      throw { status: 400, message: 'Invalid email.' };
    }
    console.log('[reset] email validation passed');

    if (!nonEmptyString(token, 16)) {
      console.log('[reset] token validation failed', {
        tokenLength: token?.length,
      });
      throw { status: 400, message: 'Invalid token.' };
    }
    console.log('[reset] token validation passed');

    if (!nonEmptyString(password, 8)) {
      console.log('[reset] password validation failed', {
        passwordLength: password?.length,
      });
      throw { status: 400, message: 'Password too short.' };
    }
    console.log('[reset] password validation passed');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.pass) {
      console.log('[reset] user not found or no password', {
        userFound: Boolean(user),
        hasPass: user?.pass ? true : false,
      });
      throw { status: 400, message: 'Invalid token or email.' };
    }
    console.log('[reset] user found', { userId: user.id });

    try {
      const p = verifyResetToken(token, user.pass);
      console.log('[reset] token verified', {
        tokenUserId: p.sub,
        dbUserId: user.id,
      });
      if (p.sub !== String(user.id)) throw new Error('User mismatch');
    } catch (err) {
      console.error('[reset] token verification failed', {
        error: err,
        errorMessage: (err as any)?.message,
      });
      throw { status: 400, message: 'Invalid or expired token.' };
    }

    const newHash = await hashPassword(password);
    console.log('[reset] password hashed');

    await prisma.user.update({
      where: { id: user.id },
      data: { pass: newHash },
    });
    console.log('[reset] password updated in database');

    // TODO (optional): revoke refresh tokens/sessions for user.id
  },
};
