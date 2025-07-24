import express from 'express';
import {
  createPlayer,
  deletePlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
} from '../controllers/playerController';
import { devAuth } from '../auth/devAuth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);
router.post('/', createPlayer);
router.put('/:id', devAuth, authorize('edit-player'), updatePlayer);
router.delete('/:id', devAuth, authorize('remove-player'), deletePlayer);

export default router;
