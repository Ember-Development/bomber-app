import express from 'express';
import {
  addUsersToGroup,
  backfillLastMessageAt,
  createGroup,
  getGroups,
} from '../controllers/groupController';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/', getGroups);
router.post('/', createGroup);
router.post('/:groupId/users', addUsersToGroup);
router.post('/admin/backfill-last-message-at', backfillLastMessageAt);

export default router;
