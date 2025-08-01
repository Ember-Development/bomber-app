import express from 'express';
import {
  addUsersToGroup,
  backfillLastMessageAt,
  createGroup,
  getGroups,
} from '../controllers/groupController';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', getGroups);
router.post('/', devAuth, authorize('create-team-group'), createGroup);
router.post(
  '/:groupId/users',
  devAuth,
  authorize('add-user-to-group'),
  addUsersToGroup
);
router.post('/admin/backfill-last-message-at', backfillLastMessageAt);

export default router;
