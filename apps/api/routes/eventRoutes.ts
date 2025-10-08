import express from 'express';
import {
  addEventAttendees,
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventAttendees,
  getEventById,
  removeEventAttendee,
  rsvpEvent,
  unRsvpEvent,
  updateEvent,
} from '../controllers/eventController';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAllEvents);
router.get('/:id', auth, getEventById);
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

// attendees management
router.get('/:id/attendees', auth, getEventAttendees);
router.post('/:id/attendees', auth, addEventAttendees);
router.delete('/:id/attendees/:userId', auth, removeEventAttendee);

// RSVP endpoints (self-serve)
router.post('/:id/rsvp', auth, rsvpEvent);
router.delete('/:id/rsvp', auth, unRsvpEvent);

export default router;
