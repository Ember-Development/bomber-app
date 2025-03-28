import express from 'express';
import { createGroup, getGroups } from '../controllers/groupController';

const router = express.Router();

router.get('/', getGroups);
router.post('/', createGroup);

export default router;
