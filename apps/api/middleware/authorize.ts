import { RequestHandler, Request, Response, NextFunction } from 'express';
import { Role, Action } from '../auth/permissions';

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
    // cast so TS knows about `user`
    const r = req as AuthenticatedRequest;

    if (!r.user) {
      return res.sendStatus(401);
    }
    if (!r.user.actions.includes(requiredAction)) {
      return res
        .status(403)
        .json({ error: `Missing permission: ${requiredAction}` });
    }

    next();
  };
}
