import { api } from './Client';

export interface ArticleFE {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const fetchArticles = async (): Promise<ArticleFE[]> => {
  try {
    const response = await api.get<ArticleFE[]>('/articles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
};

export const fetchArticleById = async (
  id: string
): Promise<ArticleFE | null> => {
  try {
    const response = await api.get<ArticleFE>(`/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
};
