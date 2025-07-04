import express from 'express';
import {
  deleteMyTeam,
  getAllTeams,
  getMyTeams,
  getTeamById,
  updateMyTeam,
} from '../controllers/teamController';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.get('/my-team', devAuth, authorize('view-my-team'), getMyTeams);
router.patch('/my-team/:id', devAuth, authorize('edit-my-team'), updateMyTeam);
router.delete(
  '/my-team/:id',
  devAuth,
  authorize('delete-my-team'),
  deleteMyTeam
);

export default router;
