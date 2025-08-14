// auth.ts
import { RequestHandler } from 'express';
import { verifyAccess } from '../utils/jwt';
import { roleToActions, Role, Action } from './permissions';
import { AuthenticatedRequest } from '../utils/express';
import { prisma } from '@bomber-app/database';

export const auth: RequestHandler = async (req, res, next) => {
  const header = req.header('Authorization') || '';
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Malformed token' });
  }

  let payload: any;
  try {
    payload = verifyAccess(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const userId: string | undefined = payload.sub;
  // Be defensive about claim names and shapes
  let primaryRole: Role | undefined =
    payload.role || payload.primaryRole || undefined;

  let roles: Role[] =
    Array.isArray(payload.roles) && payload.roles.length
      ? payload.roles
      : primaryRole
        ? [primaryRole]
        : [];

  // If we still don't have a role, fall back to DB (saves you from reissuing tokens)
  if ((!roles || roles.length === 0) && userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { primaryRole: true },
      });
      if (user?.primaryRole) {
        primaryRole = user.primaryRole as Role;
        roles = [primaryRole];
      }
    } catch (e) {
      // swallow; we'll fail below if roles still empty
    }
  }

  if (!roles || roles.length === 0) {
    return res.status(403).json({ error: 'No roles on token/user' });
  }

  const actions: Action[] = Array.from(
    new Set(roles.flatMap((r) => roleToActions[r] || []))
  );

  // Optional debug to mirror what you saw:
  // console.log('[auth] payload=', payload, 'primaryRole=', primaryRole, 'roles=', roles, 'actions=', actions);

  (req as AuthenticatedRequest).user = {
    id: userId!,
    roles,
    actions,
    primaryRole: roles[0],
  };

  next();
};
