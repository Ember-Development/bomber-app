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

export const retryMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;

  try {
    const retried = await messageService.retryMessage(messageId);
    res.json(retried);
  } catch (error) {
    console.error('Failed to retry message', error);
    res.status(500).json({ error: 'Retry failed' });
  }
};

export const getAllMessages = async (_req: Request, res: Response) => {
  try {
    const messages = await messageService.getAllMessages();
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
