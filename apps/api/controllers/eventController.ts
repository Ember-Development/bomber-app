import { Request, Response } from 'express';
import { eventService } from '../services/events';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('getEventById error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const created = await eventService.createEvent(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(400).json({ error: err });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const updated = await eventService.updateEvent(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(400).json({ error: err });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
