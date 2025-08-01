import { Article as ArticleFE } from '@bomber-app/database';
import { api } from '../api';

export const getAllArticles = async (): Promise<ArticleFE[]> => {
  const res = await api.get<ArticleFE[]>('/api/articles');
  return res.data;
};

export const getArticleById = async (id: string): Promise<ArticleFE> => {
  const res = await api.get<ArticleFE>(`/api/articles/${id}`);
  return res.data;
};
