import { api } from './api';

export interface SponsorFE {
  id: string;
  title: string;
  url: string;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const fetchSponsors = async (): Promise<SponsorFE[]> => {
  try {
    const response = await api.get<SponsorFE[]>('/sponsors');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sponsors:', error);
    return [];
  }
};
