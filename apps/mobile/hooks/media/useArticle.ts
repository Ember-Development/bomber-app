import { useQuery } from '@tanstack/react-query';
import { getAllArticles, getArticleById } from '@/api/Media/article';
import { Article as ArticleFE } from '@bomber-app/database';

export const useAllArticles = () =>
  useQuery<ArticleFE[]>({
    queryKey: ['articles'],
    queryFn: getAllArticles,
  });

export const useArticleById = (id: string) =>
  useQuery<ArticleFE>({
    queryKey: ['articles', id],
    queryFn: () => getArticleById(id),
    enabled: !!id,
  });
