import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserChats,
  getUserEvents,
  getUsersInGroup,
  updateUser,
} from '../controllers/userController';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/group/:chatId', getUsersInGroup);
router.get('/:id/events', getUserEvents);
router.get('/:id/chats', getUserChats);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
