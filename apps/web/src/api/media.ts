import { api } from './api';

export type MediaCategory =
  | 'TRAINING'
  | 'PODCAST'
  | 'HIGHLIGHTS'
  | 'INTERVIEWS'
  | 'MERCH';

export interface MediaFE {
  id: string;
  title: string;
  videoUrl: string;
  category: MediaCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaDTO {
  title: string;
  videoUrl: string;
  category: MediaCategory;
}

export interface UpdateMediaDTO {
  title?: string;
  videoUrl?: string;
  category: MediaCategory;
}

export const fetchMedia = async (): Promise<MediaFE[]> => {
  try {
    const response = await api.get<MediaFE[]>('/medias');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return [];
  }
};

export const createMedia = async (
  payload: CreateMediaDTO
): Promise<MediaFE | null> => {
  try {
    const res = await api.post<MediaFE>('/medias', payload);
    return res.data;
  } catch (error) {
    console.error('Failed to create media:', error);
    return null;
  }
};

export const updateMedia = async (
  id: string,
  payload: UpdateMediaDTO
): Promise<MediaFE | null> => {
  try {
    const res = await api.put<MediaFE>(`/medias/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error(`Failed to update media ${id}:`, error);
    return null;
  }
};

export const deleteMedia = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/medias/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete media ${id}:`, error);
    return false;
  }
};
