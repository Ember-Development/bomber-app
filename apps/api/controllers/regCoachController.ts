import { Request, Response } from 'express';
import { regCoachService } from '../services/regCoach';
import { AuthenticatedRequest } from '../auth/devAuth';

export const createOrUpdateRegCoach = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId, region } = req.body as { userId: string; region: string };

    if (!userId || !region) {
      return res
        .status(400)
        .json({ message: 'userId and region are required' });
    }

    if (req.user?.primaryRole !== 'ADMIN')
      return res.status(403).json({ message: 'Forbidden' });

    const record = await regCoachService.upsertByUser(userId, region as any);
    return res.status(200).json(record);
  } catch (err: any) {
    // handle region uniqueness nicely
    if (err?.code === 'P2002' && err?.meta?.target?.includes('region')) {
      return res
        .status(409)
        .json({ message: 'That region already has a Regional Coach.' });
    }
    console.error('createOrUpdateRegCoach error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRegCoach = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    await regCoachService.removeByUser(userId);
    return res.status(204).send();
  } catch (err) {
    console.error('deleteRegCoach error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listRegCoaches = async (_req: Request, res: Response) => {
  try {
    const rows = await regCoachService.list();
    return res.status(200).json(rows);
  } catch (err) {
    console.error('listRegCoaches error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
