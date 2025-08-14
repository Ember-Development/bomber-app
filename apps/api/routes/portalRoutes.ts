import express from 'express';
import { createLead, getLeads } from '../controllers/portalController';
import { auth } from '../auth/auth';
const router = express.Router();

router.post('/leads', auth, createLead);
router.get('/leads', auth, getLeads);

export default router;
