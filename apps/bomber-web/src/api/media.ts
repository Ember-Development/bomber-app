import { api } from './Client';

export interface MediaFE {
  id: string;
  title: string;
  videoUrl: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
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

export const fetchMediaById = async (id: string): Promise<MediaFE | null> => {
  try {
    const response = await api.get<MediaFE>(`/medias/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch video:', error);
    return null;
  }
};
