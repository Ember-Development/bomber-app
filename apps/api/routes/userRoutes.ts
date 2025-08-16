import express from 'express';
import {
  adminSoftDeleteUser,
  changePassword,
  createAddress,
  createUser,
  deleteMe,
  getAllUsers,
  getUserChats,
  getUserEvents,
  getUsersInGroup,
  updateUser,
} from '../controllers/userController';
import { authorize } from '../middleware/authorize';
import { auth } from '../auth/auth';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', auth, getAllUsers);
router.post('/', auth, createUser);
router.get('/group/:chatId', auth, getUsersInGroup);
router.get('/:id/events', auth, getUserEvents);
router.get('/:id/chats', auth, getUserChats);
router.put('/:id', auth, authorize('edit-my-info'), updateUser);
router.delete('/me', auth, deleteMe);
router.delete('/:id', auth, authorize('delete-user'), adminSoftDeleteUser);
router.post('/address', createAddress);
router.post(
  '/:id/change-password',
  auth,
  authorize('edit-my-info'),
  changePassword
);

export default router;
