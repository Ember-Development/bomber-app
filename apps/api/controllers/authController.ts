import { NextFunction, Request, RequestHandler, Response } from 'express';
import { authService } from '../services/auth';
import { UserFE } from '@bomber-app/database';
import { Action, Role } from '../auth/permissions';
import { AuthenticatedRequest } from '../utils/express';
import { revokeAllUserRefreshTokens } from '../auth/token';
import { hashEmail, maskEmail } from '../utils/log';

type ExtendedRequest = {
  user: {
    id: string;
    roles: Role[];
    actions: Action[];
    primaryRole: Role;
  };
} & Request;

function validateSignup(body: any) {
  const { email, password, fname, lname, role, phone, player, coach, parent } =
    body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw { status: 400, message: 'Invalid or missing email' };
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw { status: 400, message: 'Password must be at least 8 characters' };
  }
  if (!fname || typeof fname !== 'string') {
    throw { status: 400, message: 'First name is required' };
  }
  if (!lname || typeof lname !== 'string') {
    throw { status: 400, message: 'Last name is required' };
  }
  const roles = ['ADMIN', 'COACH', 'REGIONAL_COACH', 'PLAYER', 'PARENT', 'FAN'];
  if (!role || !roles.includes(role)) {
    throw { status: 400, message: 'Invalid or missing role' };
  }
  if (!phone || typeof phone !== 'string') {
    throw { status: 400, message: 'Phone number is required' };
  }

  if (role === 'PLAYER') {
    if (!player || !player.pos1 || !player.jerseyNum || !player.gradYear) {
      throw {
        status: 400,
        message: 'Missing required player fields: pos1, jerseyNum, gradYear',
      };
    }
  }

  return { email, password, fname, lname, role, phone, player, coach, parent };
}

function validateLogin(body: any) {
  const { email, password } = body;
  if (!email || typeof email !== 'string') {
    throw { status: 400, message: 'Email is required' };
  }
  if (!password || typeof password !== 'string') {
    throw { status: 400, message: 'Password is required' };
  }
  return { email, password };
}

function validateRefresh(body: any) {
  const { token } = body;
  if (!token || typeof token !== 'string') {
    throw { status: 400, message: 'Refresh token is required' };
  }
  return { token };
}

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const fullProfile = await authService.getUserById(user.id);
    if (!fullProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(fullProfile);
  } catch (err) {
    console.error('[CONTROLLER] Error in getCurrentUser:', err);
    next(err);
  }
};

// export const getMockLogins = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<Response | void> => {
//   try {
//     const user = await authService.getMockLogin();
//     if (!user) {
//       return res.status(404).json({ message: 'Mock user not found' });
//     }

//     // get roles
//     const roles: Role[] = [];
//     if (user.admin) roles.push('ADMIN');
//     if (user.coach) roles.push('COACH');
//     if (user.regCoach) roles.push('REGIONAL_COACH');
//     if (user.player) roles.push('PLAYER');
//     if (user.parent) roles.push('PARENT');
//     if (user.fan) roles.push('FAN');

//     // actions a user has
//     const actions: Action[] = Array.from(
//       new Set(roles.flatMap((r) => roleToActions[r] || []))
//     );

//     // respond with user + roles + actions
//     console.log(user);
//     return res.json({
//       ...user,
//       roles,
//       actions,
//     });
//   } catch (error) {
//     console.error('Error fetching mock user:', error);
//     return res.status(500).json({ error: 'Failed to fetch mock user' });
//   }
// };

export async function signupBase(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      email,
      password,
      fname,
      lname,
      role,
      phone,
      player,
      coach,
      parent,
    } = validateSignup(req.body);

    const user = await authService.signUpBase({
      email,
      password,
      fname,
      lname,
      role,
      phone,
      player,
      coach,
      parent,
    });

    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateLogin(req.body);
    const data = await authService.login(input);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('[REFRESH] body keys:', Object.keys(req.body || {}));
    const { token } = validateRefresh(req.body);
    const data = await authService.refreshToken(token);
    return res.json(data);
  } catch (err: any) {
    console.error('[REFRESH] fail:', err?.message || err);
    if (err.status === 401)
      return res.status(401).json({ error: 'Invalid refresh' });
    next(err);

    next(err);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  if (userId) await revokeAllUserRefreshTokens(userId);
  return res.sendStatus(204);
}

export async function forgotPasswordController(req: Request, res: Response) {
  const raw = req.body?.email;
  console.log('[forgot] hit', {
    emailMasked: maskEmail(raw),
    emailHash: hashEmail(raw),
  });
  await authService.requestPasswordReset(raw);
  return res.json({ ok: true });
}

export async function resetPasswordController(req: Request, res: Response) {
  console.log('[reset] controller hit', {
    hasEmail: Boolean(req.body?.email),
    emailMasked: maskEmail(req.body?.email),
    hasToken: Boolean(req.body?.token),
    tokenLength: req.body?.token?.length,
    hasPassword: Boolean(req.body?.password),
  });

  try {
    await authService.resetPassword(req.body);
    console.log('[reset] success');
    return res.json({ ok: true });
  } catch (e: any) {
    console.error('[reset] controller error', {
      message: e?.message,
      status: e?.status,
      name: e?.name,
      stack: e?.stack,
    });
    const msg = typeof e?.message === 'string' ? e.message : 'Reset failed';
    return res.status(400).json({ message: msg });
  }
}
