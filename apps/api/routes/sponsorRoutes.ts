import express from 'express';
import {
  getAllSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from '../controllers/sponsorController';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAllSponsors);
router.get('/:id', auth, getSponsorById);
router.post('/', auth, createSponsor);
router.put('/:id', auth, updateSponsor);
router.delete('/:id', auth, deleteSponsor);

export default router;
