import { api } from './api';

export interface ArticleFE {
  id: string;
  title: string;
  body: string;
  link?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDTO {
  title: string;
  body: string;
  link?: string;
  imageUrl?: string;
}

export interface UpdateArticleDTO {
  title?: string;
  body?: string;
  link?: string;
  imageUrl?: string;
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

export const createArticle = async (
  payload: CreateArticleDTO
): Promise<ArticleFE | null> => {
  try {
    const res = await api.post<ArticleFE>('/articles', payload);
    return res.data;
  } catch (error) {
    console.error('Failed to create article:', error);
    return null;
  }
};

export const updateArticle = async (
  id: string,
  payload: UpdateArticleDTO
): Promise<ArticleFE | null> => {
  try {
    const res = await api.put<ArticleFE>(`/articles/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error(`Failed to update article ${id}:`, error);
    return null;
  }
};

export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/articles/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete article ${id}:`, error);
    return false;
  }
};
