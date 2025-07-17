import { Request, Response } from 'express';
import {
  CreatePlayerInput,
  playerService,
  UpdatePlayerInput,
} from '../services/player';

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

export const getAllPlayers = async (_req: Request, res: Response) => {
  try {
    const players = await playerService.getAllPlayers();
    console.log('get players', players);
    return res.status(200).json(players);
  } catch (error) {
    console.error('getAllPlayers error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreatePlayerInput;
    const player = await playerService.createPlayer(payload);
    return res.status(201).json(player);
  } catch (error: any) {
    console.error('createPlayer error:', error);
    return res
      .status(400)
      .json({ message: error.message || 'Failed to create player' });
  }
};

export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const payload = req.body as UpdatePlayerInput;
    const player = await playerService.updatePlayer(req.params.id, payload);
    return res.status(200).json(player);
  } catch (error: any) {
    console.error('updatePlayer error:', error);
    return res
      .status(400)
      .json({ message: error.message || 'Failed to update player' });
  }
};

export const deletePlayer = async (req: Request, res: Response) => {
  try {
    await playerService.deletePlayer(req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error('deletePlayer error:', error);
    return res.status(500).json({ message: 'Failed to delete player' });
  }
};
