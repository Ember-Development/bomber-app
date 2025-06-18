import express from 'express';
import {
  getAllUsers,
  getUserChats,
  getUserEvents,
  getUsersInGroup,
  updateUser,
} from '../controllers/userController';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', getAllUsers);
router.get('/group/:chatId', getUsersInGroup);
router.get('/:id/events', getUserEvents);
router.get('/:id/chats', getUserChats);
router.put('/:id', updateUser);

export default router;
