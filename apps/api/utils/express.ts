import { Request } from 'express';
import { AuthenticatedUser } from '../auth/authUser';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
