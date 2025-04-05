import { Request, Response } from 'express';
import { groupService } from '../services/groups';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const { take, cursor } = req.query;
    const groups = await groupService.getAllGroups(
      Number(take) || 10,
      cursor ? String(cursor) : undefined
    );
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  const { title, userIds } = req.body;
  try {
    const newGroup = await groupService.createGroups(title, userIds);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const addUsersToGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { userIds } = req.body;

  try {
    const updatedGroup = await groupService.addUsersToGroup(groupId, userIds);
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add users to group' });
  }
};
