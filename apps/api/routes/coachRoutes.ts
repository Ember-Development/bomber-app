import express from 'express';
import {
  getAllCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
} from '../controllers/coachController';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/', getAllCoaches);
router.get('/:id', getCoachById);
router.put('/:id', devAuth, authorize('edit-coach'), updateCoach);
router.delete('/:id', devAuth, authorize('remove-coach'), deleteCoach);

export default router;
