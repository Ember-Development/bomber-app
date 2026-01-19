import { Request, Response } from 'express';
import { commitService } from '../services/commit';

export const commitController = {
  getAll: async (_req: Request, res: Response) => {
    const commits = await commitService.getAll();
    return res.json(commits);
  },

  getOne: async (req: Request, res: Response) => {
    const commit = await commitService.getById(req.params.id);
    if (!commit) return res.status(404).json({ error: 'Not found' });
    return res.json(commit);
  },

  create: async (req: Request, res: Response) => {
    try {
      const { name, state, city, imageUrl, committedDate } = req.body;

      if (!name || !state || !city || !committedDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const commit = await commitService.createCommit({
        name,
        state,
        city,
        imageUrl,
        committedDate: new Date(committedDate),
      });

      res.status(201).json(commit);
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error creating commit', error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const updated = await commitService.update(req.params.id, req.body);
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ error: 'Failed to update commit' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      await commitService.remove(req.params.id);
      return res.status(204).send();
    } catch {
      return res.status(404).json({ error: 'Commit not found' });
    }
  },

  syncWithSchools: async (_req: Request, res: Response) => {
    try {
      const result = await commitService.syncWithSchoolsJson();
      return res.json(result);
    } catch (error: any) {
      console.error('Error syncing commits:', error);
      return res.status(500).json({
        error: 'Failed to sync commits',
        message: error.message,
      });
    }
  },
};
