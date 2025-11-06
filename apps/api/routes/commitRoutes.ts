import { Router } from 'express';
import { commitController } from '../controllers/commitController';
import { auth } from '../auth/auth';

const router = Router();

router.get('/', commitController.getAll);
router.get('/:id', auth, commitController.getOne);
router.post('/', commitController.create);
router.patch('/:id', auth, commitController.update);
router.delete('/:id', auth, commitController.remove);

export default router;
