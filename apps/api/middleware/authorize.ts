import { RequestHandler, Request, Response, NextFunction } from 'express';
import { Role, Action, roleToActions } from '../auth/permissions';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    roles: Role[];
    actions: Action[];
    primaryRole: Role;
  };
};
export function authorize(requiredAction: Action): RequestHandler {
  return (req, res, next) => {
    const r = req as AuthenticatedRequest;

    if (!r.user) return res.sendStatus(401);

    const derived =
      r.user.actions && r.user.actions.length
        ? r.user.actions
        : (r.user.roles || [r.user.primaryRole]).flatMap(
            (role) => roleToActions[role] || []
          );

    if (!derived.includes(requiredAction)) {
      return res
        .status(403)
        .json({ error: `Missing permission: ${requiredAction}` });
    }

    next();
  };
}
