import { Request, Response } from 'express';
import { eventService } from '../services/events';
import {
  AttendanceStatus,
  EventType,
} from '@bomber-app/database/generated/client';
import { NewEvent, NewEventAttendance } from '@bomber-app/database';
import { AuthenticatedRequest } from '../utils/express';

type ReqUser = {
  id: string;
  roles: any[];
  primaryRole: any;
};

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
    const {
      event,
      attendees = [],
      tournamentID = null,
    }: {
      event: NewEvent;
      attendees?: NewEventAttendance[];
      tournamentID?: string | null;
    } = req.body;

    if (!event) return res.status(400).json({ error: 'Missing "event"' });

    // keep your GLOBAL early guard to help clients fail fast
    if (event.eventType === EventType.GLOBAL && attendees.length > 0) {
      return res.status(400).json({
        error:
          'Global events implicitly invite all users; do not include attendees.',
      });
    }

    const currentUser = (req as AuthenticatedRequest).user;
    if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

    const result = await eventService.createEvent(
      currentUser,
      event,
      attendees,
      tournamentID
    );

    res.status(201).json(result);
  } catch (err: any) {
    const status = err?.status ?? 400;
    res
      .status(status)
      .json({ error: err?.message ?? 'Failed to create event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const updated = await eventService.updateEvent(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    console.error('updateEvent error:', err);
    res.status(400).json({ error: err?.message || 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the authenticated user from the request (added by auth middleware)
    const currentUser = (req as any).user; // or req.user if you have proper typing

    await eventService.deleteEvent(id, currentUser);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('deleteEvent error:', error);
    const status = (error as any).status || 500;
    res.status(status).json({
      error: error instanceof Error ? error.message : 'Failed to delete event',
    });
  }
};

export const getEventAttendees = async (req: Request, res: Response) => {
  try {
    const attendees = await eventService.getEventAttendees(req.params.id);
    res.json(attendees);
  } catch (err) {
    console.error('getEventAttendees error:', err);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
};

export const addEventAttendees = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

    const eventID = req.params.id;
    const {
      userIds,
      status,
    }: { userIds: string[]; status?: AttendanceStatus } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds (string[]) required' });
    }
    const effectiveStatus: AttendanceStatus = (status as any) || 'PENDING';

    const result = await eventService.addAttendeesToEvent({
      currentUser,
      eventID,
      userIds,
      status: effectiveStatus,
    });

    res.json(result);
  } catch (err: any) {
    const code = err?.status || 400;
    res.status(code).json({
      error: err?.message || 'Failed to add attendees',
      details: err?.details,
    });
  }
};

export const removeEventAttendee = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

    const eventID = req.params.id;
    const userID = req.params.userId;

    if (!userID)
      return res.status(400).json({ error: 'userId param required' });

    await eventService.removeAttendeeFromEvent({
      currentUser,
      eventID,
      userID,
    });
    res.status(204).end();
  } catch (err: any) {
    const code = err?.status || 400;
    res
      .status(code)
      .json({ error: err?.message || 'Failed to remove attendee' });
  }
};

export const rsvpEvent = async (req: Request, res: Response) => {
  try {
    const eventID = req.params.id;
    // get the authed userId from your auth middleware; fallback to body for now
    const userID = (req as any).user?.id ?? req.body.userID;
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });

    const raw = String(req.body.status || '').toUpperCase();
    if (!['ATTENDING', 'MAYBE', 'DECLINED'].includes(raw)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const status = raw as AttendanceStatus;

    const updated = await eventService.setAttendanceStatus({
      eventID,
      userID,
      status,
    });
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 'GLOBAL_NOT_ALLOWED') {
      return res
        .status(400)
        .json({ error: 'Global events do not track attendees' });
    }
    console.error('rsvpEvent error:', err);
    res.status(500).json({ error: 'Failed to RSVP' });
  }
};

export const unRsvpEvent = async (req: Request, res: Response) => {
  try {
    const eventID = req.params.id;
    const userID = (req as any).user?.id ?? req.body.userID;
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });
    await eventService.removeAttendance({ eventID, userID });
    res.status(204).end();
  } catch (err) {
    console.error('unRsvpEvent error:', err);
    res.status(500).json({ error: 'Failed to remove RSVP' });
  }
};
