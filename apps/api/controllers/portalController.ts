import { Request, Response } from 'express';
import { portalService } from '../services/portal';

export async function createLead(req: Request, res: Response) {
  try {
    const lead = await portalService.createLead(req.body);
    return res.status(201).json(lead);
  } catch (e: any) {
    console.error('createLead error:', e);
    return res
      .status(400)
      .json({ message: e.message ?? 'Failed to create lead' });
  }
}

export async function getLeads(req: Request, res: Response) {
  try {
    const leads = await portalService.getLeads();
    return res.status(200).json(leads);
  } catch (e: any) {
    console.error('getLeads error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
