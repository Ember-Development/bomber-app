import { RequestHandler } from 'express';
import { verifyAccess } from '../utils/jwt';
import { roleToActions, Role, Action } from './permissions';
import { AuthenticatedRequest } from '../utils/express';

export const auth: RequestHandler = (req, res, next) => {
  const header = req.header('Authorization') || '';
  console.log('[AUTH] /me auth header:', header);

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

  const userId: string = payload.sub;
  const primaryRole: Role = payload.role;
  const roles: Role[] = Array.isArray(payload.role)
    ? payload.role
    : [primaryRole];

  const actions: Action[] = Array.from(
    new Set(roles.flatMap((r) => roleToActions[r] || []))
  );

  (req as AuthenticatedRequest).user = {
    id: userId,
    roles,
    actions,
    primaryRole: roles[0],
  };

  next();
};
