// api/schools/schools.ts
import { api } from '../api';

export type SchoolData = {
  division: string;
  conferences?: { conference?: string; schools?: any[] }[];
  schools?: any[];
};

export const getAllSchools = async (): Promise<SchoolData[]> => {
  const res = await api.get<SchoolData[]>('/api/schools');
  return res.data;
};
