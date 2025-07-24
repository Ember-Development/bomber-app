import { Request, Response } from 'express';
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

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.softDeleteUser(id);
    return res.status(204).send();
  } catch (err) {
    console.error('[deleteUser]', err);
    return res.status(500).json({ error: 'Failed to delete user' });
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
