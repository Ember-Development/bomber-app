import express from 'express';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';
import {
  addCoachToTeam,
  addPlayerToTeam,
  addTrophyToTeam,
  createTeam,
  deleteTeam,
  deleteTrophy,
  getAllTeams,
  getTeamById,
  updateTeam,
  updateTrophy,
  deleteMyTeam,
  getMyTeams,
  updateMyTeam,
} from '../controllers/teamController';

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
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

router.post('/:teamId/coaches', addCoachToTeam);
router.post('/:teamId/players', addPlayerToTeam);

// trophies
router.post('/:teamId/trophies', addTrophyToTeam);
router.put('/:teamId/trophies/:trophyId', updateTrophy);
router.delete('/:teamId/trophies/:trophyId', deleteTrophy);

export default router;
