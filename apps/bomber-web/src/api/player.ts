import { api } from './Client';

export interface AlumniPlayer {
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

export const fetchAlumniPlayers = async (): Promise<AlumniPlayer[]> => {
  try {
    const response = await api.get<AlumniPlayer[]>('/players/alumni');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch alumni players:', error);
    return [];
  }
};
