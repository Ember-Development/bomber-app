import { Request, Response } from 'express';
import { sponsorService } from '../services/sponsor';

export const getAllSponsors = async (_req: Request, res: Response) => {
  try {
    const sponsors = await sponsorService.getAllSponsors();
    return res.status(200).json(sponsors);
  } catch (err) {
    console.error('getAllSponsors error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSponsorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sponsor = await sponsorService.getSponsorById(id);
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }
    return res.status(200).json(sponsor);
  } catch (err) {
    console.error('getSponsorById error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSponsor = async (req: Request, res: Response) => {
  try {
    const { title, url, logoUrl } = req.body;
    const newSponsor = await sponsorService.createSponsor({
      title,
      url,
      logoUrl,
    });
    return res.status(201).json(newSponsor);
  } catch (err) {
    console.error('createSponsor error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSponsor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, url, logoUrl } = req.body;
    const updated = await sponsorService.updateSponsor(id, {
      title,
      url,
      logoUrl,
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('updateSponsor error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSponsor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sponsorService.deleteSponsor(id);
    return res.status(204).send();
  } catch (err) {
    console.error('deleteSponsor error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
