import express from 'express';
import { getAllTeams, getTeamById } from '../controllers/teamController';

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:id', getTeamById);

export default router;
