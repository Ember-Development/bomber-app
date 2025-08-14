import express from 'express';
import {
  addChildToParent,
  removeChildFromParent,
  getParentById,
  ensureForMe,
} from '../controllers/parentController';
import { auth } from '../auth/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/:id', auth, getParentById);
router.post('/ensure', auth, ensureForMe);
router.post('/:id/children', auth, authorize('edit-player'), addChildToParent);
router.delete(
  '/:id/children/:playerId',
  auth,
  authorize('edit-player'),
  removeChildFromParent
);

export default router;
