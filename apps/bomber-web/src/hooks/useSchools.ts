import { useQuery } from '@tanstack/react-query';
import { fetchSchools } from '@/api/school';
import type { FlatSchool } from '@/utils/school';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useSchools() {
  return useQuery<FlatSchool[]>({
    queryKey: ['schools'],
    queryFn: fetchSchools,
    staleTime: CACHE_TTL,
    gcTime: CACHE_TTL,
  });
}
