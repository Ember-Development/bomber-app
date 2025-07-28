import { Router } from 'express';
import { commitController } from '../controllers/commitController';

const router = Router();

router.get('/', commitController.getAll);
router.get('/:id', commitController.getOne);
router.post('/', commitController.create);
router.patch('/:id', commitController.update);
router.delete('/:id', commitController.remove);

export default router;
