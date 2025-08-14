// routes/mediaRoutes.ts
import express from 'express';
import {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
} from '../controllers/mediaController';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAllMedia);
router.get('/:id', auth, getMediaById);
router.post('/', auth, createMedia);
router.put('/:id', auth, updateMedia);
router.delete('/:id', auth, deleteMedia);

export default router;
