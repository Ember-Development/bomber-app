import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController';

const router = express.Router();

router.get('/:groupId', getMessages);
router.post('/', sendMessage);

export default router;
