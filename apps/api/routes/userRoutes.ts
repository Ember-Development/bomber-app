import express from 'express';
import { getAllUsers, getUsersInGroup } from '../controllers/userController';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/group/:chatId', getUsersInGroup);

export default router;
