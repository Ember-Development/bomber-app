import express from 'express';
import {
  getAllSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from '../controllers/sponsorController';

const router = express.Router();

router.get('/', getAllSponsors);
router.get('/:id', getSponsorById);
router.post('/', createSponsor);
router.put('/:id', updateSponsor);
router.delete('/:id', deleteSponsor);

export default router;
