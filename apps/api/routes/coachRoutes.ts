import express from 'express';
import {
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
  removeCoachFromTeam,
} from '../controllers/coachController';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAllCoaches);
router.get('/:id', auth, getCoachById);
router.put('/:id', auth, authorize('edit-coach'), updateCoach);
router.post(
  '/remove-coach-from-team',
  auth,
  authorize('edit-coach'),
  removeCoachFromTeam
);

router.delete('/:id', auth, authorize('remove-coach'), deleteCoach);

export default router;
