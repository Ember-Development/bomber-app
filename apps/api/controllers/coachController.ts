import { Request, Response } from 'express';
import { coachService, UpdateCoachInput } from '../services/coach';
import { error } from 'console';
import { AuthenticatedRequest } from '../utils/express';

export const getAllCoaches = async (_req: Request, res: Response) => {
  try {
    const coaches = await coachService.getAllCoaches();
    return res.status(200).json(coaches);
  } catch (error) {
    console.error('getAllCoaches error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCoachById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const coach = await coachService.getCoachById(id);

    if (!coach) return res.status(404).json({ message: 'Coach not found' });

    return res.status(200).json(coach);
  } catch (error) {
    console.error('getCoachById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCoach = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actingUserId = req.user?.id;
    const role = req.user?.roles[0]; // assuming first role is primary

    if (!actingUserId || !role) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const coach = await coachService.updateCoach(
      id,
      req.body,
      actingUserId,
      role
    );
    return res.status(200).json(coach);
  } catch (error: any) {
    console.error('updateCoach error:', error);
    return res
      .status(400)
      .json({ message: error.message || 'Failed to update coach' });
  }
};

export const removeCoachFromTeam = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { coachId, teamId } = req.body as { coachId: string; teamId: string };
    if (!coachId || !teamId) {
      return res
        .status(400)
        .json({ message: 'coachId and teamId are required' });
    }

    const actingUserId = req.user!.id;
    const role = req.user!.primaryRole;

    const updatedTeam = await coachService.removeCoachFromTeam(
      coachId,
      teamId,
      actingUserId,
      role
    );
    return res.status(200).json(updatedTeam);
  } catch (err) {
    error(err);
  }
};

export const deleteCoach = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const actingUserId = req.user?.id;
    const role = req.user?.roles[0]; // assuming first role is primary

    if (!actingUserId || !role) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await coachService.deleteCoach(id, actingUserId, role);
    return res.status(204).send();
  } catch (error: any) {
    console.error('deleteCoach error:', error);
    return res
      .status(400)
      .json({ message: error.message || 'Failed to delete coach' });
  }
};
