import express from 'express';
import {
  addPlayerToTeam,
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getAlumniPlayers,
  getPlayerById,
  updatePlayer,
} from '../controllers/playerController';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/', getAllPlayers);
router.get('/alumni', getAlumniPlayers);
router.get('/:id', getPlayerById);
router.post('/', createPlayer);
router.post('/add-to-team', addPlayerToTeam);
router.put('/:id', devAuth, authorize('edit-player'), updatePlayer);
router.delete('/:id', devAuth, authorize('remove-player'), deletePlayer);

export default router;
