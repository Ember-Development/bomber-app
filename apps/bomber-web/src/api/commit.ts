import { api } from './api';

export interface PlayerCommit {
  id: string;
  fname?: string | null;
  lname?: string | null;
  email?: string | null;
  profilePhoto?: string | null;
}

export interface Commit {
  id: string;
  name: string;
  state: string;
  city: string;
  imageUrl: string;
  committedDate: string;
  players: Array<{
    id: string;
    jerseyNum?: string | null;
    pos1?: string | null;
    pos2?: string | null;
    gradYear?: string | null;
    user: PlayerCommit | null;
  }>;
}

export const fetchCommits = async (): Promise<Commit[]> => {
  try {
    const response = await api.get<Commit[]>('/commits');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch commits:', error);
    return [];
  }
};
