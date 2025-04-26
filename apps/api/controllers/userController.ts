import { Request, Response } from 'express';
import { userService } from '../services/user';

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
