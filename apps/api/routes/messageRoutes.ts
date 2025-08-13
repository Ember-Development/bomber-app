import express from 'express';
import {
  getAllMessages,
  getMessages,
  retryMessage,
  sendMessage,
} from '../controllers/messageController';
import { auth } from '../auth/auth';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/:groupId', auth, getMessages);
router.post('/', auth, sendMessage);
router.post('/:messageId/retry', auth, retryMessage);
router.get('/', auth, getAllMessages);

export default router;
