import express from 'express';
import {
  addUsersToGroup,
  createGroup,
  getGroups,
} from '../controllers/groupController';

const router = express.Router();

router.get('/', getGroups);
router.post('/', createGroup);
router.post('/:groupId/users', addUsersToGroup);

export default router;
