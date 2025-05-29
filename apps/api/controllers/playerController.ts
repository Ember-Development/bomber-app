import { Request, Response } from 'express';
import { playerService } from '../services/player';

export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await playerService.getPlayerById(id);

    if (!player) return res.status(404).json({ message: 'Player not found' });

    return res.status(200).json(player);
  } catch (error) {
    console.error('getPlayerById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
