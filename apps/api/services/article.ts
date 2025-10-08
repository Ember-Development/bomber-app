import { ArticleDB as ArticleDB } from '@bomber-app/database';
import { prisma } from '../api';

export interface ArticleCreateInput {
  title: string;
  body: string;
  link?: string;
  imageUrl?: string;
}

export interface ArticleUpdateInput {
  title?: string;
  body?: string;
  link?: string | null;
  imageUrl?: string | null;
}

export const articleService = {
  getAllArticles: async (): Promise<ArticleDB[]> => prisma.article.findMany(),

  getArticleById: async (id: string): Promise<ArticleDB | null> =>
    prisma.article.findUnique({ where: { id } }),

  createArticle: async (data: ArticleCreateInput): Promise<ArticleDB> =>
    prisma.article.create({ data }),

  updateArticle: async (
    id: string,
    data: ArticleUpdateInput
  ): Promise<ArticleDB> => prisma.article.update({ where: { id }, data }),

  deleteArticle: async (id: string): Promise<ArticleDB> =>
    prisma.article.delete({ where: { id } }),
};
