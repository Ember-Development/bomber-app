import { RequestHandler } from 'express';
import { verifyAccess } from '../utils/jwt';
import { roleToActions, Role, Action } from './permissions';
import { AuthenticatedRequest } from '../utils/express';
import { prisma } from '../api';

export const auth: RequestHandler = async (req, res, next) => {
  const header = req.header('Authorization') || '';
  console.log('[AUTH:jwt] header len=', header.length);
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    console.warn('[AUTH:jwt] Malformed token header');
    return res.status(401).json({ error: 'Malformed token' });
  }

  let payload: any;
  try {
    payload = verifyAccess(token);
    console.log('[AUTH:jwt] Token verified, payload:', payload);
  } catch (error) {
    console.error('[AUTH:jwt] Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const userId: string | undefined = payload.sub;
  if (!userId) {
    console.warn('[AUTH:jwt] Token missing sub (userId)');
    return res.status(401).json({ error: 'Invalid token: Missing user ID' });
  }

  let primaryRole: Role | undefined =
    payload.role || payload.primaryRole || undefined;
  let roles: Role[] =
    Array.isArray(payload.roles) && payload.roles.length
      ? payload.roles
      : primaryRole
        ? [primaryRole]
        : [];

  // If no roles in token, fall back to database
  if (roles.length === 0) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { primaryRole: true },
      });
      if (!user) {
        console.warn(`[AUTH:jwt] User not found for ID: ${userId}`);
        return res.status(401).json({ error: 'User not found' });
      }
      if (user.primaryRole) {
        primaryRole = user.primaryRole as Role;
        roles = [primaryRole];
        console.log(
          `[AUTH:jwt] Fetched roles from DB for user ${userId}:`,
          roles
        );
      }
    } catch (error) {
      console.error(
        `[AUTH:jwt] Database error fetching user ${userId}:`,
        error
      );
      return res.status(500).json({ error: 'Failed to authenticate user' });
    }
  }

  if (roles.length === 0) {
    console.warn(`[AUTH:jwt] No roles found for user ${userId}`);
    return res.status(403).json({ error: 'No roles assigned to user' });
  }

  const actions: Action[] = Array.from(
    new Set(roles.flatMap((r) => roleToActions[r] || []))
  );

  (req as AuthenticatedRequest).user = {
    id: userId,
    roles,
    actions,
    primaryRole: roles[0],
  };

  console.log(
    `[AUTH:jwt] User authenticated: ${userId}, roles: ${roles.join(', ')}`
  );
  next();
};
