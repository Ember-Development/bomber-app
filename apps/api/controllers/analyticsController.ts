import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await analyticsService.getAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('getAnalytics error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
