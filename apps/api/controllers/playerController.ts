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
  const playerId = String(req.params.id);
  const rawParentId = (req.body?.parentId ?? '').toString().trim();

  console.log('[attachParentToPlayer] start', { playerId, rawParentId });

  if (!rawParentId) {
    console.log('[attachParentToPlayer] missing parentId in body');
    return res.status(400).json({ message: 'parentId is required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // --- Step 1: resolve Parent.id from either Parent.id or User.id
      console.log('[attachParentToPlayer] resolve parent start');

      // Try as Parent.id
      let parent = await tx.parent.findUnique({
        where: { id: rawParentId },
        select: { id: true, userID: true },
      });

      if (parent) {
        console.log('[attachParentToPlayer] resolved via Parent.id', {
          parentId: parent.id,
        });
      } else {
        // Try as User.id -> existing Parent?
        const parentByUser = await tx.parent.findUnique({
          where: { userID: rawParentId },
          select: { id: true, userID: true },
        });

        if (parentByUser) {
          parent = parentByUser;
          console.log(
            '[attachParentToPlayer] resolved via User.id -> existing Parent',
            {
              parentId: parent.id,
              userID: parent.userID,
            }
          );
        } else {
          // Try as User.id -> create Parent (ensure) if the User exists
          const user = await tx.user.findUnique({
            where: { id: rawParentId },
            select: { id: true },
          });

          if (!user) {
            console.log('[attachParentToPlayer] not a Parent.id or User.id', {
              rawParentId,
            });
            return res
              .status(404)
              .json({ message: 'Parent (or User) not found' });
          }

          console.log(
            '[attachParentToPlayer] creating Parent via ensure() for user',
            { userId: user.id }
          );
          parent = await tx.parent.upsert({
            where: { userID: user.id },
            update: {},
            create: {
              user: { connect: { id: user.id } },
              // address is required in your schema; create a minimal one
              address: {
                create: {
                  state: 'TX',
                  city: 'Unknown',
                  zip: '00000',
                  address1: 'Pending',
                },
              },
            },
            select: { id: true, userID: true },
          });
          console.log('[attachParentToPlayer] created/ensured Parent', {
            parentId: parent.id,
            userID: parent.userID,
          });
        }
      }

      // --- Step 2: verify Player exists
      const player = await tx.player.findUnique({
        where: { id: playerId },
        select: { id: true },
      });
      if (!player) {
        console.log('[attachParentToPlayer] player not found', { playerId });
        return res.status(404).json({ message: 'Player not found' });
      }

      // --- Step 3: idempotency check
      const alreadyLinked = await tx.player.findFirst({
        where: { id: playerId, parents: { some: { id: parent.id } } },
        select: { id: true },
      });

      if (alreadyLinked) {
        console.log('[attachParentToPlayer] already linked, no-op', {
          playerId,
          parentId: parent.id,
        });
      } else {
        console.log('[attachParentToPlayer] linking now', {
          playerId,
          parentId: parent.id,
        });
        await tx.player.update({
          where: { id: playerId },
          data: { parents: { connect: { id: parent.id } } },
        });
        console.log('[attachParentToPlayer] link complete');
      }

      // --- Step 4: return hydrated PlayerFE
      const hydrated = await tx.player.findUnique({
        where: { id: playerId },
        include: {
          user: true,
          team: true,
          parents: { include: { user: true } },
          address: true,
        },
      });

      console.log('[attachParentToPlayer] done', {
        playerId,
        parentId: parent.id,
        parentsCount: hydrated?.parents?.length ?? 0,
      });

      return hydrated;
    });

    if (!result || (result as any).statusCode) return; // early response already sent inside tx
    return res.status(200).json(result);
  } catch (e: any) {
    console.error('attachParentToPlayer error:', e);
    return res
      .status(400)
      .json({ message: e?.message ?? 'Failed to link parent to player' });
  }
}

export async function detachParentFromPlayer(req: Request, res: Response) {
  const playerId = String(req.params.id);
  // accept either /:parentId param or body.parentId for flexibility
  const rawParentId = (req.params.parentId ?? req.body?.parentId ?? '')
    .toString()
    .trim();

  console.log('[detachParentFromPlayer] start', { playerId, rawParentId });

  if (!rawParentId) {
    return res.status(400).json({ message: 'parentId is required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // --- Step 1: resolve Parent.id from either Parent.id or User.id
      console.log('[detachParentFromPlayer] resolve parent start');

      // Try as Parent.id
      let parent = await tx.parent.findUnique({
        where: { id: rawParentId },
        select: { id: true, userID: true },
      });

      if (!parent) {
        // Try as User.id -> find existing Parent for that user
        const parentByUser = await tx.parent.findUnique({
          where: { userID: rawParentId },
          select: { id: true, userID: true },
        });
        if (!parentByUser) {
          console.log('[detachParentFromPlayer] parent not found', {
            rawParentId,
          });
          return res
            .status(404)
            .json({ message: 'Parent (or User) not found' });
        }
        parent = parentByUser;
      }

      // --- Step 2: verify Player exists
      const playerExists = await tx.player.findUnique({
        where: { id: playerId },
        select: { id: true },
      });
      if (!playerExists) {
        return res.status(404).json({ message: 'Player not found' });
      }

      // --- Step 3: check link & disconnect if linked
      const linkExists = await tx.player.findFirst({
        where: { id: playerId, parents: { some: { id: parent.id } } },
        select: { id: true },
      });

      if (!linkExists) {
        console.log('[detachParentFromPlayer] not linked, no-op', {
          playerId,
          parentId: parent.id,
        });
      } else {
        console.log('[detachParentFromPlayer] unlinking now', {
          playerId,
          parentId: parent.id,
        });
        await tx.player.update({
          where: { id: playerId },
          data: { parents: { disconnect: { id: parent.id } } },
        });
        console.log('[detachParentFromPlayer] unlink complete');
      }

      // --- Step 4: return hydrated PlayerFE (same include as attach)
      const hydrated = await tx.player.findUnique({
        where: { id: playerId },
        include: {
          user: true,
          team: true,
          parents: { include: { user: true } },
          address: true,
        },
      });

      return hydrated;
    });

    if (!result || (result as any).statusCode) return; // early response sent
    return res.status(200).json(result);
  } catch (e: any) {
    console.error('detachParentFromPlayer error:', e);
    return res
      .status(400)
      .json({ message: e?.message ?? 'Failed to unlink parent from player' });
  }
}
