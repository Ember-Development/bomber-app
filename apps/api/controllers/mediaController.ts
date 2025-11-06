// controllers/mediaController.ts
import { Request, Response } from 'express';
import { mediaService } from '../services/media';
import { MediaCategory } from '@bomber-app/database/generated/client';

const isValidCategory = (cat: string): cat is MediaCategory => {
  // Defensive check: if MediaCategory is not loaded, return false
  if (!MediaCategory || typeof MediaCategory !== 'object') {
    console.error('MediaCategory enum not loaded from Prisma client');
    return false;
  }
  return Object.values(MediaCategory).includes(cat as MediaCategory);
};

export const getAllMedia = async (_req: Request, res: Response) => {
  try {
    const items = await mediaService.getAllMedia();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMediaById = async (req: Request, res: Response) => {
  try {
    const item = await mediaService.getMediaById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createMedia = async (req: Request, res: Response) => {
  try {
    const { title, videoUrl, category } = req.body;

    const cat: MediaCategory = isValidCategory(category)
      ? category
      : MediaCategory.HIGHLIGHTS; // fallback

    const newItem = await mediaService.createMedia({
      title,
      videoUrl,
      category: cat,
    });
    res.status(201).json(newItem);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, category } = req.body;
    const updated = await mediaService.updateMedia(id, {
      title,
      videoUrl,
      category,
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await mediaService.deleteMedia(id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};
