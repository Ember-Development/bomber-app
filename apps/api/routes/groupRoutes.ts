import express from 'express';
import {
  addUsersToGroup,
  backfillLastMessageAt,
  createGroup,
  getGroups,
} from '../controllers/groupController';
import { authorize } from '../middleware/authorize';
import { auth } from '../auth/auth';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', auth, getGroups);
router.post('/', auth, authorize('create-team-group'), createGroup);
router.post(
  '/:groupId/users',
  auth,
  authorize('add-user-to-group'),
  addUsersToGroup
);
router.post('/admin/backfill-last-message-at', auth, backfillLastMessageAt);

export default router;
