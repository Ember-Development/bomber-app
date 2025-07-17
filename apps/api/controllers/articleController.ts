// controllers/articleController.ts
import { Request, Response } from 'express';
import { articleService } from '../services/article';

export const getAllArticles = async (_req: Request, res: Response) => {
  try {
    const list = await articleService.getAllArticles();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const art = await articleService.getArticleById(req.params.id);
    if (!art) return res.status(404).json({ message: 'Not found' });
    res.json(art);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, body, link, imageUrl } = req.body;
    const newArt = await articleService.createArticle({
      title,
      body,
      link,
      imageUrl,
    });
    res.status(201).json(newArt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, body, link, imageUrl } = req.body;
    const updated = await articleService.updateArticle(id, {
      title,
      body,
      link: link ?? null,
      imageUrl: imageUrl ?? null,
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await articleService.deleteArticle(id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
};
