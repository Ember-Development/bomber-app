import { Media as MediaFE } from '@bomber-app/database';
import { api } from '../api';

export const getAllMedia = async (): Promise<MediaFE[]> => {
  const res = await api.get<MediaFE[]>('/api/medias');
  return res.data;
};

export const getMediaById = async (id: string): Promise<MediaFE> => {
  const res = await api.get<MediaFE>(`/api/medias/${id}`);
  return res.data;
};
