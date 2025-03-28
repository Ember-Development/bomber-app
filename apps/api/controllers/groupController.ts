import { Request, Response } from 'express';
import { groupService } from '../services/groups';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await groupService.getAllGroups();
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
