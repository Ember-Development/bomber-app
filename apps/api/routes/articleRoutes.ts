import express from 'express';
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';
import { auth } from '../auth/auth';

const router = express.Router();

router.get('/', auth, getAllArticles);
router.get('/:id', auth, getArticleById);
router.post('/', auth, createArticle);
router.put('/:id', auth, updateArticle);
router.delete('/:id', auth, deleteArticle);

export default router;
