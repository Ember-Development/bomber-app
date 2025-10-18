import { NextFunction, Request, Response } from 'express';
import { CreateUserInput, userService } from '../services/user';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { AuthenticatedRequest } from '../utils/express';
import { regCoachService } from '../services/regCoach';
import { UserRole } from '@bomber-app/database/generated/client';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users in group' });
  }
};

export const getUsersInGroup = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const users = await userService.getUsersByChatId(chatId);
    res.json(users);
  } catch (err) {
    console.error('getUsersInGroup error:', err);
    res.status(500).json({ error: 'Failed to fetch users in group' });
  }
};

export const getUserEvents = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const events = await userService.getUserEvents(id);
    res.json(events);
  } catch (error) {
    console.error('Error Fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
};

export const getUserChats = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const chats = await userService.getUserChats(id);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching user chats', error);
    res.status(500).json({ error: 'Failed to fetch user chats' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateUserInput;
    const user = await userService.createUser(payload);
    return res.status(201).json(user);
  } catch (err) {
    console.error('[createUser]', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const deleteMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = (req as any)?.user?.id;
    if (!id) return res.status(401).json({ error: 'Not authenticated' });
    await userService.softDeleteUser(id);
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const adminSoftDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = String(req.params.id);
    await userService.softDeleteUser(id);
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

export async function createAddress(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { address1, address2, city, state, zip } = req.body;

    if (!address1 || !city || !state || !zip) {
      return res
        .status(400)
        .json({ message: 'Missing required address fields' });
    }

    const address = await userService.createAddress({
      address1,
      address2,
      city,
      state,
      zip,
    });

    return res.status(201).json(address);
  } catch (err) {
    next(err);
  }
}

export const changePassword = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Missing current or new password' });

    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ error: 'New password must be at least 8 characters' });

    const requesterId = req.user?.id || req.user?.sub;
    const isSelf = requesterId === id;
    const isAdmin =
      req.user?.roles?.includes?.('ADMIN') || req.user?.role === 'ADMIN';
    if (!isSelf && !isAdmin)
      return res.status(403).json({ error: 'Forbidden' });

    await userService.changePassword({
      userId: id,
      currentPassword,
      newPassword,
    });
    return res.status(204).send();
  } catch (e: any) {
    if (e?.message === 'USER_NOT_FOUND')
      return res.status(404).json({ error: 'User not found' });
    if (e?.message === 'BAD_CURRENT_PASSWORD')
      return res.status(401).json({ error: 'Current password is incorrect' });

    console.error('[changePassword] error', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const ensureRoleAndSettable = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { role } = req.body as { role: 'COACH' | 'ADMIN' | 'FAN' };

    if (!userId || !role)
      return res.status(400).json({ message: 'userId and role are required' });

    if (req.user?.primaryRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await userService.ensureRole(userId, role);
    return res.status(204).send();
  } catch (err: any) {
    console.error('ensureRole error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRegCoachRegion = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { region } = req.body as { region: string };
    if (!userId || !region)
      return res
        .status(400)
        .json({ message: 'userId and region are required' });

    const reg = await regCoachService.upsertRegionWithTakeover(userId, region);
    return res.status(200).json(reg);
  } catch (err: any) {
    console.error('updateRegCoachRegion error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const demoteFromRegCoach = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;
    // Optional: choose new role; default to COACH if not provided
    const { newRole } = req.query as { newRole?: UserRole }; // 'ADMIN' | 'COACH' | 'FAN' | etc
    const targetRole: UserRole = (newRole as UserRole) ?? 'COACH';

    // 1) delete RegCoach row (idempotent)
    await userService.deleteByUserId(userId);

    // 2) ensure the target role row exists if needed (COACH/ADMIN/FAN)
    //    (re-uses your existing ensureRole logic)
    await userService.ensureRole(userId, targetRole as any);

    // 3) set primaryRole
    await userService.setPrimaryRole(userId, targetRole);

    return res.status(204).send();
  } catch (err: any) {
    console.error('demoteFromRegCoach error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLatestVersion = async (req: Request, res: Response) => {
  try {
    // Hardcoded latest version for now (update this manually or via config)
    const latestVersion = '1.0.6'; // Example: Update to the latest version number
    res.json({ version: latestVersion });
  } catch (error) {
    console.error('Error fetching latest version:', error);
    res.status(500).json({ error: 'Failed to fetch latest version' });
  }
};
