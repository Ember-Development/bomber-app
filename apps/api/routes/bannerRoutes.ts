// routes/bannerRoutes.ts
import express from 'express';
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAllBanners);
router.get('/:id', auth, getBannerById);
router.post('/', auth, createBanner);
router.put('/:id', auth, updateBanner);
router.delete('/:id', auth, deleteBanner);

export default router;
