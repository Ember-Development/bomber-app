import { api } from './api';

export type SchoolData = {
  division: string;
  conferences?: { conference?: string; schools?: any[] }[];
  schools?: any[];
};

export const fetchSchools = async (): Promise<SchoolData[]> => {
  try {
    const response = await api.get<SchoolData[]>('/schools');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    return [];
  }
};
