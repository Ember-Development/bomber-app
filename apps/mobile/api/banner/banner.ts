// src/api/banner.ts
import { Banner } from '@bomber-app/database';
import { api } from '../api';

export const getAllBanners = async (): Promise<Banner[]> => {
  const res = await api.get<Banner[]>('/api/banners');
  return res.data;
};

export const getBannerById = async (id: string): Promise<Banner> => {
  const res = await api.get<Banner>(`/api/banners/${id}`);
  return res.data;
};

///////////

export interface BannerCreateInput {
  imageUrl: string;
  duration: number;
  expiresAt: string;
}
export const createBanner = async (
  data: BannerCreateInput
): Promise<Banner> => {
  const res = await api.post<Banner>('/api/banners', data);
  return res.data;
};

/////////////

export interface BannerUpdateInput {
  imageUrl?: string;
  duration?: number;
  expiresAt?: string;
}
export const updateBanner = async (
  id: string,
  data: BannerUpdateInput
): Promise<Banner> => {
  const res = await api.put<Banner>(`/api/banners/${id}`, data);
  return res.data;
};

export const deleteBanner = async (id: string): Promise<void> => {
  await api.delete(`/api/banners/${id}`);
};
