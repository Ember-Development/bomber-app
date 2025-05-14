import { Request, Response } from 'express';
import { authService } from '../services/auth';

export const getMockLogins = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const user = await authService.getMockLogin();
    if (!user) {
      return res.status(404).json({ message: 'Mock user not found' });
    }
    res.json(user);
    console.log(user);
  } catch (error) {
    console.error('Error fetching mock user:', error);
    res.status(500).json({ error: 'Failed to fetch mock user' });
  }
};
