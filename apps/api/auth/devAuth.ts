import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth';
import { roleToActions, Role, Action } from '../auth/permissions';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles: Role[];
    actions: Action[];
    primaryRole: Role;
  };
}

export async function devAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // 1) fetch your “mock” user from the DB
    const user = await authService.getMockLogin();
    if (!user) {
      return res.status(401).json({ error: 'Mock user not found' });
    }

    // 2) derive roles from the included relations
    const roles: Role[] = [];
    if (user.admin) roles.push('ADMIN');
    if (user.coach) roles.push('COACH');
    if (user.regCoach) roles.push('REGIONAL_COACH');
    if (user.player) roles.push('PLAYER');
    if (user.parent) roles.push('PARENT');
    if (user.fan) roles.push('FAN');

    // 3) flatten to a unique actions array
    const actions: Action[] = Array.from(
      new Set(roles.flatMap((r) => roleToActions[r] || []))
    );

    // 4) attach to req.user
    req.user = {
      id: user.id,
      roles,
      actions,
      primaryRole: roles[0],
    };

    next();
  } catch (err) {
    console.error('devAuth error', err);
    res.sendStatus(401);
  }
}
