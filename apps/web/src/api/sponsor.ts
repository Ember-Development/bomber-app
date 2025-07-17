import { api } from './api';
import type { SponsorItem as SponsorFE } from '@/pages/Sponsor';

export interface CreateSponsorDTO {
  title: string;
  url: string;
  logoUrl?: string;
}

export interface UpdateSponsorDTO {
  title?: string;
  url?: string;
  logoUrl?: string;
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

export const getSponsorById = async (id: string): Promise<SponsorFE | null> => {
  try {
    const res = await api.get<SponsorFE>(`/sponsors/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch sponsor ${id}:`, error);
    return null;
  }
};

export const createSponsor = async (
  payload: CreateSponsorDTO
): Promise<SponsorFE | null> => {
  try {
    const res = await api.post<SponsorFE>('/sponsors', payload);
    return res.data;
  } catch (error) {
    console.error('Failed to create sponsor:', error);
    return null;
  }
};

export const updateSponsor = async (
  id: string,
  payload: UpdateSponsorDTO
): Promise<SponsorFE | null> => {
  try {
    const res = await api.put<SponsorFE>(`/sponsors/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error(`Failed to update sponsor ${id}:`, error);
    return null;
  }
};

export const deleteSponsor = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/sponsors/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete sponsor ${id}:`, error);
    return false;
  }
};
