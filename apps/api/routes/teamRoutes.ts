import express from 'express';
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
} from '../controllers/teamController';

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
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
