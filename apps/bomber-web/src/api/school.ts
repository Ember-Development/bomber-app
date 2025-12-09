import { api } from './Client';
import { flattenSchools, type FlatSchool } from '@/utils/school';

export const fetchSchools = async (): Promise<FlatSchool[]> => {
  try {
    const response = await api.get('/schools');
    return flattenSchools(response.data);
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    return [];
  }
};
