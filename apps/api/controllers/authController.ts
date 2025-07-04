import { Request, Response } from 'express';
import { authService } from '../services/auth';
import { roleToActions, Role, Action } from '../auth/permissions';

export const getMockLogins = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const user = await authService.getMockLogin();
    if (!user) {
      return res.status(404).json({ message: 'Mock user not found' });
    }

    // get roles
    const roles: Role[] = [];
    if (user.admin) roles.push('ADMIN');
    if (user.coach) roles.push('COACH');
    if (user.regCoach) roles.push('REGIONAL_COACH');
    if (user.player) roles.push('PLAYER');
    if (user.parent) roles.push('PARENT');
    if (user.fan) roles.push('FAN');

    // actions a user has
    const actions: Action[] = Array.from(
      new Set(roles.flatMap((r) => roleToActions[r] || []))
    );

    // respond with user + roles + actions
    console.log(user);
    return res.json({
      ...user,
      roles,
      actions,
    });
  } catch (error) {
    console.error('Error fetching mock user:', error);
    return res.status(500).json({ error: 'Failed to fetch mock user' });
  }
};
