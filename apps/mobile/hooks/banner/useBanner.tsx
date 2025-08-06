import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBanners, getBannerById } from '@/api/banner/banner';
import { Banner } from '@bomber-app/database';

export const useBanners = () =>
  useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: getAllBanners,
    staleTime: 1000 * 60 * 5, // 5m
    refetchOnWindowFocus: false,
  });

export const useBannerById = (id?: string) =>
  useQuery<Banner>({
    queryKey: ['banner', id],
    queryFn: () => getBannerById(id!),
    enabled: Boolean(id),
  });
