import { Request, Response } from 'express';
import { messageService } from '../services/messages';

export const getMessages = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { cursor, limit } = req.query;
  try {
    const messages = await messageService.getMessages(groupId, {
      cursor: cursor as string | undefined,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { text, groupId, userId } = req.body;
  try {
    const message = await messageService.sendMessage(text, groupId, userId);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};
