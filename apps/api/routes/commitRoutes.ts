import { Router } from 'express';
import { commitController } from '../controllers/commitController';
import { auth } from '../auth/auth';

const router = Router();

router.get('/', commitController.getAll);
router.post('/', commitController.create);
router.post('/sync-schools', auth, commitController.syncWithSchools);
router.get('/:id', auth, commitController.getOne);
router.patch('/:id', auth, commitController.update);
router.delete('/:id', auth, commitController.remove);

export default router;
