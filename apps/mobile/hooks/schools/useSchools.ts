// hooks/schools/useSchools.ts
import { useQuery } from '@tanstack/react-query';
import { getAllSchools, SchoolData } from '@/api/schools/schools';
import { flattenSchools, FlatSchool } from '@/utils/SchoolUtil';
import { useMemo } from 'react';

/**
 * Hook to fetch and cache schools from the API
 * Falls back to bundled schools if the query is disabled or fails
 * Caches for 24 hours to minimize API calls
 */
export const useSchools = () => {
  const query = useQuery<SchoolData[]>({
    queryKey: ['schools'],
    queryFn: getAllSchools,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (cache time)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Flatten schools data for easy searching
  const flatSchools = useMemo<FlatSchool[]>(() => {
    if (!query.data) return [];
    return flattenSchools(query.data);
  }, [query.data]);

  return {
    ...query,
    schools: flatSchools,
  };
};
