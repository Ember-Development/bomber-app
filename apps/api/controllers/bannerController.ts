// controllers/bannerController.ts
import { Request, Response } from 'express';
import { bannerService } from '../services/banner';

export const getAllBanners = async (_req: Request, res: Response) => {
  try {
    const banners = await bannerService.getAllBanners();
    res.json(banners);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBannerById = async (req: Request, res: Response) => {
  try {
    const banner = await bannerService.getBannerById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Not found' });
    res.json(banner);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { imageUrl, link, duration, expiresAt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'imageUrl is required' });
    }

    const newBanner = await bannerService.createBanner({
      imageUrl,
      link: link || undefined,
      duration: parseInt(duration),
      expiresAt: new Date(expiresAt),
    });
    res.status(201).json(newBanner);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageUrl, duration } = req.body;
    const expiresAt = duration
      ? new Date(Date.now() + duration * 1000)
      : undefined;
    const updated = await bannerService.updateBanner(id, {
      imageUrl,
      duration,
      expiresAt,
    });
    res.json(updated);
  } catch (e) {
    console.error('updateBanner error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await bannerService.deleteBanner(id);
    res.status(204).send();
  } catch (e) {
    console.error('deleteBanner error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};
