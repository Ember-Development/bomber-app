import { Request, Response } from 'express';
import { parentService } from '../services/parent';

export async function getParentById(req: Request, res: Response) {
  try {
    const parent = await parentService.getParentById(String(req.params.id));
    if (!parent) return res.status(404).json({ message: 'Parent not found' });
    return res.status(200).json(parent);
  } catch (e) {
    console.error('getParentById error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function addChildToParent(req: Request, res: Response) {
  try {
    const parentId = String(req.params.id);
    const { playerId } = req.body as { playerId: string | number };
    if (!playerId)
      return res.status(400).json({ message: 'playerId is required' });

    const updated = await parentService.addChild(parentId, String(playerId));
    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('addChildToParent error:', e);
    return res
      .status(400)
      .json({ message: e?.message ?? 'Failed to link player to parent' });
  }
}

export async function removeChildFromParent(req: Request, res: Response) {
  try {
    const parentId = String(req.params.id);
    const playerId = String(req.params.playerId);

    const updated = await parentService.removeChild(parentId, playerId);
    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('removeChildFromParent error:', e);
    return res
      .status(400)
      .json({ message: e?.message ?? 'Failed to unlink player from parent' });
  }
}

export async function ensureForMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'UNAUTHORIZED' });

    const parent = await parentService.ensureForUser(userId);
    res.json({ id: parent.id, parent });
  } catch (e: any) {
    console.error('ensure parentid error:', e);
    return res
      .status(400)
      .json({ message: e?.message ?? 'Failed to ensure id' });
  }
}
