import express from 'express';
import { auth } from '../auth/auth';
import { authorize } from '../middleware/authorize';
import {
  createOrUpdateRegCoach,
  deleteRegCoach,
  listRegCoaches,
} from '../controllers/regCoachController';

const router = express.Router();

router.get('/', auth, authorize('edit-coach'), listRegCoaches);
router.post('/', auth, authorize('edit-coach'), createOrUpdateRegCoach);
router.delete('/:userId', auth, authorize('edit-coach'), deleteRegCoach);

export default router;
