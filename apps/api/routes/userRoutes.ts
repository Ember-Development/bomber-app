import express from 'express';
import {
  adminSoftDeleteUser,
  changePassword,
  createAddress,
  createUser,
  deleteMe,
  demoteFromRegCoach,
  ensureRoleAndSettable,
  getAllUsers,
  getLatestVersion,
  getUserChats,
  getUserEvents,
  getUsersInGroup,
  updateRegCoachRegion,
  updateUser,
} from '../controllers/userController';
import { authorize } from '../middleware/authorize';
import { auth } from '../auth/auth';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', auth, getAllUsers);
router.get('/web', getAllUsers);
router.post('/', auth, createUser);
router.post(
  '/:userId/ensure-role',
  auth,
  authorize('edit-coach'),
  ensureRoleAndSettable
);
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
router.patch(
  '/:userId/reg-coach',
  auth,
  authorize('edit-coach'),
  updateRegCoachRegion
);

router.delete(
  '/:userId/reg-coach',
  auth,
  authorize('edit-coach'),
  demoteFromRegCoach
);

router.get('/latest-version', auth, getLatestVersion);

export default router;
