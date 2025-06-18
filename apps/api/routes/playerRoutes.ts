import express from 'express';
import { getPlayerById } from '../controllers/playerController';

const router = express.Router();

router.get('/:id', getPlayerById);

export default router;
