import { api } from './api';
import {
  AgeGroup,
  Regions,
  State,
  TeamFE,
  TrophyFE,
} from '@bomber-app/database';

export const fetchTeams = async (): Promise<TeamFE[]> => {
  try {
    const response = await api.get<TeamFE[]>('/teams');
    return response.data;
  } catch {
    return [];
  }
};

export const getTeamById = async (id: string): Promise<TeamFE> => {
  const { data } = await api.get<TeamFE>(`/teams/${id}`);
  return data;
};

/////////////////////////////////////////////////////////////////

export interface CreateTeamDTO {
  name: string;
  ageGroup: AgeGroup;
  region: Regions;
  state: State;
  headCoachUserID?: string | null;
}

export const createTeam = async (
  payload: CreateTeamDTO
): Promise<TeamFE | null> => {
  try {
    const { data } = await api.post<TeamFE>('/teams', payload);
    return data;
  } catch (err) {
    console.error('Failed to create team', err);
    return null;
  }
};

/////////////////////////////////////////////////////////////////

export interface UpdateTeamDTO {
  name?: string;
  ageGroup?: string;
  region?: string;
  state?: string;
  headCoachUserID?: string | null;
}

export const updateTeam = async (
  id: string,
  payload: UpdateTeamDTO
): Promise<TeamFE | null> => {
  try {
    const { data } = await api.put<TeamFE>(`/teams/${id}`, payload);
    return data;
  } catch (err) {
    console.error('Failed to update team', err);
    return null;
  }
};

export const deleteTeam = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/teams/${id}`);
    return true;
  } catch (err) {
    console.error('Failed to delete team', err);
    return false;
  }
};

/////////////////////////////////////////////////////////////////

export interface AddCoachDTO {
  userID: string;
}

export const addCoachToTeam = async (
  teamId: string,
  payload: AddCoachDTO
): Promise<TeamFE | null> => {
  try {
    const { data } = await api.post<TeamFE>(
      `/teams/${teamId}/coaches`,
      payload
    );
    return data;
  } catch (err) {
    console.error('Failed to add coach to team', err);
    return null;
  }
};

/////////////////////////////////////////////////////////////////

export interface AddPlayerDTO {
  userID: string;
}

export const addPlayerToTeam = async (
  teamId: string,
  payload: AddPlayerDTO
): Promise<TeamFE | null> => {
  try {
    const { data } = await api.post<TeamFE>(
      `/teams/${teamId}/players`,
      payload
    );
    return data;
  } catch (err) {
    console.error('Failed to add player to team', err);
    return null;
  }
};

/////////////////////////////////////////////////////////////////
export interface CreateTrophyDTO {
  title: string;
  imageURL: string;
}

export const addTrophyToTeam = async (
  teamId: string,
  payload: CreateTrophyDTO
): Promise<TrophyFE | null> => {
  try {
    const { data } = await api.post<TrophyFE>(
      `/teams/${teamId}/trophies`,
      payload
    );
    return data;
  } catch (err) {
    console.error('Failed to add trophy to team', err);
    return null;
  }
};

export interface UpdateTrophyDTO {
  title?: string;
  imageURL?: string;
}

export const updateTrophy = async (
  teamId: string,
  trophyId: string,
  payload: UpdateTrophyDTO
): Promise<TrophyFE | null> => {
  try {
    const { data } = await api.put<TrophyFE>(
      `/teams/${teamId}/trophies/${trophyId}`,
      payload
    );
    return data;
  } catch (err) {
    console.error('Failed to update trophy', err);
    return null;
  }
};

export const deleteTrophy = async (
  teamId: string,
  trophyId: string
): Promise<boolean> => {
  try {
    await api.delete(`/teams/${teamId}/trophies/${trophyId}`);
    return true;
  } catch (err) {
    console.error('Failed to delete trophy', err);
    return false;
  }
};
