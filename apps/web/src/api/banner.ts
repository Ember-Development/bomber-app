import { api } from './api';

export interface BannerFE {
  id: string;
  imageUrl: string;
  duration: number; // hours
  expiresAt: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateBannerDTO {
  imageUrl: string;
  duration: number;
  expiresAt: string; // ISO string
}

export interface UpdateBannerDTO {
  imageUrl?: string;
  duration?: number;
  expiresAt?: string; // ISO string
}

export const fetchBanners = async (): Promise<BannerFE[]> => {
  try {
    const response = await api.get<BannerFE[]>('/banners');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return [];
  }
};

export const getBannerById = async (id: string): Promise<BannerFE | null> => {
  try {
    const res = await api.get<BannerFE>(`/banners/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch banner ${id}:`, error);
    return null;
  }
};

export const createBanner = async (
  payload: CreateBannerDTO
): Promise<BannerFE | null> => {
  try {
    const res = await api.post<BannerFE>('/banners', payload);
    return res.data;
  } catch (error) {
    console.error('Failed to create banner:', error);
    return null;
  }
};

export const updateBanner = async (
  id: string,
  payload: UpdateBannerDTO
): Promise<BannerFE | null> => {
  try {
    const res = await api.put<BannerFE>(`/banners/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error(`Failed to update banner ${id}:`, error);
    return null;
  }
};

export const deleteBanner = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/banners/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete banner ${id}:`, error);
    return false;
  }
};
