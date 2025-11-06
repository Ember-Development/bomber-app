import { useState, useEffect, useMemo } from 'react';
import { fetchSchools, SchoolData } from '@/api/schools';
import { flattenSchools, FlatSchool } from '@/utils/school';

const CACHE_KEY = 'schools_cache';
const CACHE_TIMESTAMP_KEY = 'schools_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook to fetch and cache schools from the API
 * Uses localStorage for caching with 24-hour expiration
 */
export function useSchools() {
  const [data, setData] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          setData(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const schools = await fetchSchools();

      if (schools.length > 0) {
        setData(schools);
        localStorage.setItem(CACHE_KEY, JSON.stringify(schools));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load schools')
      );
      console.error('Error loading schools:', err);
    } finally {
      setLoading(false);
    }
  }

  // Flatten schools data for easy searching
  const flatSchools = useMemo<FlatSchool[]>(() => {
    if (!data || data.length === 0) return [];
    return flattenSchools(data);
  }, [data]);

  return {
    schools: flatSchools,
    rawData: data,
    loading,
    error,
    refresh: loadSchools,
  };
}
