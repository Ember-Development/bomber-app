import { useQuery } from '@tanstack/react-query';
import { getAllMedia, getMediaById } from '@/api/Media/media';
import { Media as MediaFE } from '@bomber-app/database';

export const useAllMedia = () =>
  useQuery<MediaFE[]>({
    queryKey: ['media'],
    queryFn: getAllMedia,
  });

export const useMediaById = (id: string) =>
  useQuery<MediaFE>({
    queryKey: ['media', id],
    queryFn: () => getMediaById(id),
    enabled: !!id,
  });
