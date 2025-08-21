import { NextFunction, Request, Response } from 'express';
import {
  CreatePlayerInput,
  playerService,
  UpdatePlayerInput,
} from '../services/player';
import { Role } from '../auth/permissions';
import { prisma } from '@bomber-app/database';
import { AuthenticatedRequest } from '../utils/express';

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
    return res.status(200).json(players);
  } catch (error) {
    console.error('getAllPlayers error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAlumniPlayers = async (req: Request, res: Response) => {
  try {
    const { cursor, limit = 20 } = req.query;
    const players = await playerService.getAlumniPlayers({
      cursor: cursor as string,
      limit: parseInt(limit as string),
    });
    return res.status(200).json(players);
  } catch (error) {
    console.error('getAlumniPlayers error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUnassignedPlayers = async (req: Request, res: Response) => {
  try {
    const { cursor, limit = 20, search, ageGroup } = req.query;
    const result = await playerService.getUnassignedPlayers({
      cursor: cursor as string | undefined,
      limit: parseInt(limit as string) || 20,
      search: (search as string) || undefined,
      ageGroup: (ageGroup as string) || undefined,
    });
    return res.status(200).json(result); // { items, nextCursor }
  } catch (error) {
    console.error('getUnassignedPlayers error:', error);
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

export const updatePlayer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const payload = req.body as UpdatePlayerInput;
    const role = (req.user as any)?.role ?? req.user!.primaryRole;

    const player = await playerService.updatePlayer(
      req.params.id,
      payload,
      req.user!.id,
      role
    );

    return res.status(200).json(player);
  } catch (error: any) {
    console.error('updatePlayer error:', error);
    return res
      .status(400)
      .json({ message: error.message || 'Failed to update player' });
  }
};

export const deletePlayer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const actingUserId = req.user!.id;
    const role = req.user!.primaryRole;

    await playerService.deletePlayer(req.params.id, actingUserId, role);
    return res.status(204).send();
  } catch (error: any) {
    console.error('deletePlayer error:', error);
    return res
      .status(403)
      .json({ message: error.message || 'Failed to delete player' });
  }
};

export async function addPlayerToTeam(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { playerId, teamCode } = req.body;

    if (!playerId || !teamCode) {
      return res
        .status(400)
        .json({ message: 'playerId and teamCode are required' });
    }

    const updatedPlayer = await playerService.addPlayerToTeamByCode(
      playerId,
      teamCode
    );
    return res.status(200).json(updatedPlayer);
  } catch (err) {
    next(err);
  }
}

export const removePlayerFromTeam = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.params.id;
    const actingUserId = req.user!.id;
    const role = req.user!.primaryRole;

    const updated = await playerService.removePlayerFromTeam(
      playerId,
      actingUserId,
      role
    );

    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('removePlayerFromTeam error:', error);
    return res
      .status(error?.status ?? 400)
      .json({ message: error?.message ?? 'Failed to remove player from team' });
  }
};

export async function createForPlayer(req: Request, res: Response) {
  const { playerId } = req.params;
  const { name, state, city, imageUrl, committedDate } = req.body;

  try {
    const result = await playerService.createAndAttachToPlayer(playerId, {
      name,
      state,
      city,
      imageUrl,
      committedDate,
    });

    return res.status(201).json(result);
  } catch (err: any) {
    const msg = err?.message ?? 'Failed to create commit';
    return res.status(400).json({ error: msg });
  }
}

export async function attachParentToPlayer(req: Request, res: Response) {
  try {
    const playerId = String(req.params.id);
    const { parentId } = req.body as { parentId: string | number };
    if (!parentId)
      return res.status(400).json({ message: 'parentId is required' });

    const parentIdStr = String(parentId);

    try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Hard 404s to prevent P2025
      const [player, parent] = await Promise.all([
        tx.player.findUnique({ where: { id: playerId }, select: { id: true } }),
        tx.parent.findUnique({ where: { id: parentIdStr }, select: { id: true } }),
      ]);
      if (!player) return res.status(404).json({ message: 'Player not found' });
      if (!parent) return res.status(404).json({ message: 'Parent not found' });

      // 2) Idempotency: only connect if not already linked
      const alreadyLinked = await tx.player.findFirst({
        where: { id: playerId, parents: { some: { id: parentIdStr } } },
        select: { id: true },
      });

      if (!alreadyLinked) {
        await tx.player.update({
          where: { id: playerId },
          data: { parents: { connect: { id: parentIdStr } } },
        });
      }

      // 3) Return hydrated PlayerFE (user, team, parents, address)
      return tx.player.findUnique({
        where: { id: playerId },
        include: {
          user: true,
          team: true,
          parents: { include: { user: true } },
          address: true,
        },
      });
    });

    // If we returned early with a 404, result is a Response already
    if (!result || (result as any).statusCode) return;

    return res.status(200).json(result);
  } catch (e: any) {
    console.error('attachParentToPlayer error:', e);
    return res.status(400).json({ message: e?.message ?? 'Failed to link parent to player' });
  }
}
}
