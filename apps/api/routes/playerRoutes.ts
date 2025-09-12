import express from 'express';
import {
  addPlayerToTeam,
  createForPlayer,
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getAlumniPlayers,
  getPlayerById,
  updatePlayer,
  getUnassignedPlayers,
  attachParentToPlayer,
  removePlayerFromTeam,
} from '../controllers/playerController';
import { authorize } from '../middleware/authorize';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAllPlayers);
router.get('/alumni', auth, getAlumniPlayers);
router.get('/unassigned', auth, getUnassignedPlayers);
router.get('/:id', auth, getPlayerById);
router.post('/', auth, createPlayer);
router.post('/:id/commit', auth, createForPlayer);
router.post('/add-to-team', addPlayerToTeam);
router.put('/:id', auth, authorize('edit-player'), updatePlayer);
router.delete(
  '/:id/team',
  auth,
  authorize('edit-player'),
  removePlayerFromTeam
);
router.post(
  '/:id/parents',
  auth,
  authorize('edit-player'),
  attachParentToPlayer
);
router.delete('/:id', auth, authorize('remove-player'), deletePlayer);

export default router;
