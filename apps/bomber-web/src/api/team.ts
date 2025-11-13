import { api } from './Client';

export interface TeamFE {
  id: string;
  name: string;
  ageGroup?: string | null;
  division?: string | null;
  state?: string | null;
  region?: string | null;
  coachID?: string | null;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  jerseyNum?: string | null;
  pos1?: string | null;
  pos2?: string | null;
  gradYear?: string | null;
  user: {
    id: string;
    fname?: string | null;
    lname?: string | null;
    profilePhoto?: string | null;
  } | null;
  commit: {
    imageUrl: string;
    name: string;
  } | null;
}

export interface CoachData {
  id: string;
  user: {
    id: string;
    fname?: string | null;
    lname?: string | null;
    profilePhoto?: string | null;
    email?: string | null;
  } | null;
}

export interface TeamDetail extends TeamFE {
  players: Player[];
  coaches: CoachData[];
  headCoach: CoachData | null;
}

export const fetchTeams = async (): Promise<TeamFE[]> => {
  try {
    const response = await api.get<TeamFE[]>('/teams');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return [];
  }
};

export const fetchTeamById = async (id: string): Promise<TeamDetail | null> => {
  try {
    const response = await api.get<TeamDetail>(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return null;
  }
};
