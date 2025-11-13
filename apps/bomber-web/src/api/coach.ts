import { api } from './Client';

export interface CoachUser {
  id: string;
  fname?: string | null;
  lname?: string | null;
  email?: string | null;
  phone?: string | null;
  profilePhoto?: string | null;
}

export interface CoachAddress {
  id: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

export interface CoachTeam {
  id: string;
  name: string;
  ageGroup?: string | null;
  region?: string | null;
  state?: string | null;
}

export interface Coach {
  id: string;
  user: CoachUser | null;
  address: CoachAddress | null;
  headTeams: CoachTeam[];
  teams: CoachTeam[];
}

export const fetchCoaches = async (): Promise<Coach[]> => {
  try {
    const response = await api.get<Coach[]>('/coaches');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch coaches:', error);
    return [];
  }
};
