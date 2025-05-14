import express from 'express';
import {
  getAllUsers,
  getUserChats,
  getUserEvents,
  getUsersInGroup,
} from '../controllers/userController';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', getAllUsers);
router.get('/group/:chatId', getUsersInGroup);
router.get('/:id/events', getUserEvents);
router.get('/:id/chats', getUserChats);

export default router;
