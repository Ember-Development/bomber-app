import { NextFunction, Request, Response } from 'express';
import { CreateUserInput, userService } from '../services/user';
import { AuthenticatedRequest } from '../auth/devAuth';

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
