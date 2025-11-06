import { Router } from 'express';
import { submitContact } from '../controllers/contactController';

const router = Router();

// POST /api/contact - Submit contact form
router.post('/', submitContact);

export default router;
