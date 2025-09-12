import { Request, Response } from 'express';
import { groupService } from '../services/groups';
import { prisma } from '@bomber-app/database';
import { AuthenticatedRequest } from '../utils/express';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const { take, cursor } = req.query;

    const parsedCursor =
      typeof cursor === 'string' ? JSON.parse(cursor) : undefined;

    const groups = await groupService.getAllGroups(
      take ? Number(take) : undefined,
      parsedCursor
    );
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const createGroup = async (req: AuthenticatedRequest, res: Response) => {
  const { title, userIds } = req.body;

  const actingUserId = req.user?.id;
  const role = req.user?.primaryRole;

  if (!actingUserId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const newGroup = await groupService.createGroup(
      title,
      userIds,
      actingUserId,
      role
    );
    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const addUsersToGroup = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { groupId } = req.params;
  const { userIds } = req.body;

  const actingUserId = req.user?.id;
  const role = req.user?.primaryRole;

  if (!actingUserId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const updatedGroup = await groupService.addUsersToGroup(
      groupId,
      userIds,
      actingUserId,
      role
    );
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add users to group' });
  }
};

export const backfillLastMessageAt = async (req: Request, res: Response) => {
  try {
    const chats = await prisma.chat.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    for (const chat of chats) {
      const latestMessage = chat.messages[0];

      if (latestMessage) {
        await prisma.chat.update({
          where: { id: chat.id },
          data: {
            lastMessageAt: latestMessage.createdAt,
          },
        });
      }
    }

    res.status(200).json({ message: 'lastMessageAt backfilled successfully' });
  } catch (error) {
    console.error('Backfill failed:', error);
    res.status(500).json({ error: 'Backfill failed' });
  }
};
