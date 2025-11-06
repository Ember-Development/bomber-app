import { Router } from 'express';
import { submitRecruitment } from '../controllers/recruitmentController';

const router = Router();

// POST /api/recruitment - Submit recruitment application
router.post('/', submitRecruitment);

export default router;
