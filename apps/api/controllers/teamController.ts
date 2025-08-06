import { AuthenticatedRequest } from '../auth/devAuth';
import { CreateTeamInput, teamService } from '../services/teams';
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

export const getTeamByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const team = await teamService.getTeamByCode(code);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching team' });
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

export const createTeam = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateTeamInput;
    const team = await teamService.createTeam(payload);
    return res.status(201).json(team);
  } catch (error) {
    console.error('[createTeam]', error);
    return res.status(500).json({ error: 'Failed to create team' });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await teamService.updateTeam(id, payload);
    return res.json(updated);
  } catch (error) {
    console.error('[updateTeam]', error);
    if ((error as any).code === 'P2025') {
      // Prisma not found
      return res.status(404).json({ error: 'Team not found' });
    }
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

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await teamService.deleteTeam(id);
    return res.status(204).send();
  } catch (error) {
    console.error('[deleteTeam]', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }
    return res.status(500).json({ error: 'Failed to delete team' });
  }
};

export const addCoachToTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userID } = req.body as { userID: string };
    const team = await teamService.addCoachToTeam(teamId, userID);
    res.json(team);
  } catch (err) {
    console.error('[addCoachToTeam]', err);
    res.status(500).json({ error: 'Failed to add coach' });
  }
};

export const addPlayerToTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userID } = req.body as { userID: string };
    const team = await teamService.addPlayerToTeam(teamId, userID);
    res.json(team);
  } catch (err) {
    console.error('[addPlayerToTeam]', err);
    res.status(500).json({ error: 'Failed to add player' });
  }
};

export const addTrophyToTeam = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { teamId } = req.params;
    const { title, imageURL } = req.body as { title: string; imageURL: string };
    const trophy = await teamService.addTrophy(teamId, title, imageURL);
    res.status(201).json(trophy);
  } catch (err: any) {
    console.error('[addTrophyToTeam]', err);
    if (err.message.includes('max')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to add trophy' });
  }
};

export const updateTrophy = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { trophyId } = req.params;
    const payload = req.body as { title?: string; imageURL?: string };
    const updated = await teamService.updateTrophy(
      trophyId,
      payload,
      req.user!.id,
      req.user!.primaryRole
    );
    res.json(updated);
  } catch (err) {
    console.error('[updateTrophy]', err);
    res.status(403).json({ error: 'Unauthorized to update trophy' });
  }
};

export const deleteTrophy = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { trophyId } = req.params;
    await teamService.deleteTrophy(
      trophyId,
      req.user!.id,
      req.user!.primaryRole
    );
    res.status(204).send();
  } catch (err) {
    console.error('[deleteTrophy]', err);
    res.status(403).json({ error: 'Unauthorized to delete trophy' });
  }
};
