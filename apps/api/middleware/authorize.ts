import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../auth/devAuth';
import { Action } from '../auth/permissions';

export function authorize(requiredAction: Action) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    if (req.user.actions.includes(requiredAction)) {
      return next();
    }
    return res
      .status(403)
      .json({ error: `Missing permission: ${requiredAction}` });
  };
}
