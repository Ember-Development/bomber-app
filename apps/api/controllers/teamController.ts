import { AuthenticatedRequest } from '../auth/devAuth';
import { teamService } from '../services/teams';
import { Request, Response } from 'express';

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await teamService.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await teamService.getTeamById(id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error('[getTeamById]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyTeams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const teams = await teamService.getMyTeams(userId);
    return res.json(teams);
  } catch (err) {
    console.error('[getMyTeams]', err);
    return res.status(500).json({ error: 'Failed to fetch your teams' });
  }
};

export const updateMyTeam = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await teamService.updateTeam(id, updates);
    return res.json(updated);
  } catch (err) {
    console.error('[updateMyTeam]', err);
    return res.status(500).json({ error: 'Failed to update team' });
  }
};

export const deleteMyTeam = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    await teamService.deleteTeam(id);
    return res.sendStatus(204);
  } catch (err) {
    console.error('[deleteMyTeam]', err);
    return res.status(500).json({ error: 'Failed to delete team' });
  }
};
