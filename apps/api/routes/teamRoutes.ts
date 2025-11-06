import express from 'express';
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
  getTeamByCode,
} from '../controllers/teamController';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.get('/code/:code', getTeamByCode);
router.get('/my-team', auth, authorize('view-my-team'), getMyTeams);
router.patch('/my-team/:id', auth, authorize('edit-my-team'), updateMyTeam);
router.delete('/my-team/:id', auth, authorize('delete-my-team'), deleteMyTeam);
router.post('/', auth, createTeam);
router.put('/:id', auth, updateTeam);
router.delete('/:id', auth, deleteTeam);

router.post('/:teamId/coaches', addCoachToTeam);
router.post('/:teamId/players', addPlayerToTeam);

// trophies
router.post(
  '/:teamId/trophies',
  auth,
  authorize('create-trophy'),
  addTrophyToTeam
);
router.put(
  '/:teamId/trophies/:trophyId',
  auth,
  authorize('edit-trophy'),
  updateTrophy
);
router.delete(
  '/:teamId/trophies/:trophyId',
  auth,
  authorize('remove-trophy'),
  deleteTrophy
);

export default router;
