import express from 'express';
import {
  getAllMessages,
  getMessages,
  retryMessage,
  sendMessage,
} from '../controllers/messageController';

const router = express.Router();

// ALL OF THESE NEED AUTH GUARDS
router.get('/:groupId', getMessages);
router.post('/', sendMessage);
router.post('/:messageId/retry', retryMessage);
router.get('/', getAllMessages);

export default router;
