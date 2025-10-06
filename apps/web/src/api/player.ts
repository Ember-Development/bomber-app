// src/api/player.ts

import {
  AgeGroup,
  JerseySize,
  PantsSize,
  Player,
  PlayerFE,
  Position,
  Prisma,
  ShortsSize,
  StirrupSize,
} from '@bomber-app/database';
import { api } from './api';

type CreatePlayerInput = Prisma.PlayerCreateInput;
type UpdatePlayerInput = Prisma.PlayerUpdateInput;

// we flatten out Address into top‐level props for create/update
export type CreatePlayerPayload = Omit<CreatePlayerInput, 'address'> & {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
};
export type UpdatePlayerPayload = Omit<UpdatePlayerInput, 'address'> & {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

// Get all players (now includes nested address)
export const fetchPlayers = async (): Promise<Player[]> => {
  try {
    const res = await api.get<Player[]>('/players');
    return res.data.map((p: any) => ({
      id: String(p.id),
      pos1: p.pos1 as Position,
      pos2: p.pos2 as Position,
      jerseyNum: String(p.jerseyNum),
      gradYear: String(p.gradYear),
      jerseySize: p.jerseySize as JerseySize,
      pantSize: p.pantSize as PantsSize,
      stirrupSize: p.stirrupSize as StirrupSize,
      shortSize: p.shortSize as ShortsSize,
      practiceShortSize: p.practiceShortSize as ShortsSize,
      phone: String(p.phone),
      parentPhone: String(p.parentPhone),
      parentEmail: String(p.parentEmail),
      ageGroup: p.ageGroup as AgeGroup,
      college: p.college ?? null,
      userID: String(p.userID),
      teamID: String(p.teamID),
      name: p.user ? `${p.user.fname} ${p.user.lname}` : '(No Name)',
      email: p.user?.email || '',
      team: p.team?.name || '',
      isTrusted: p.isTrusted ?? false,
      addressID: p.address?.id ? String(p.address.id) : '',
      address1: p.address?.address1 || '',
      address2: p.address?.address2 || '',
      city: p.address?.city || '',
      state: p.address?.state || '',
      zip: p.address?.zip || '',
      commitId: p.commitId ?? null,
    }));
  } catch (err) {
    console.error('Failed to fetch players:', err);
    return [];
  }
};

// Create a player (including flat address props)
export const createPlayer = async (
  payload: CreatePlayerPayload
): Promise<PlayerFE | null> => {
  try {
    const { data } = await api.post<PlayerFE>('/players', payload);
    return data;
  } catch (err) {
    console.error('Failed to create player:', err);
    return null;
  }
};

// Update a player (including flat address props)
export const updatePlayer = async (
  id: string,
  payload: UpdatePlayerPayload
): Promise<PlayerFE | null> => {
  try {
    const { data } = await api.put<PlayerFE>(`/players/${id}`, payload);
    return data;
  } catch (err) {
    console.error(`Failed to update player ${id}:`, err);
    return null;
  }
};

// Delete a player
export const deletePlayer = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/players/${id}`);
    return true;
  } catch (err) {
    console.error(`Failed to delete player ${id}:`, err);
    return false;
  }
};

export const fetchPlayerById = async (id: string): Promise<PlayerFE> => {
  const { data } = await api.get(`/players/${id}`);
  return data as PlayerFE;
};

export const removePlayerFromTeam = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/players/${id}/team`);
    return true;
  } catch (err) {
    console.error(`Failed to remove player ${id} from team:`, err);
    return false;
  }
};
<<<<<<< HEAD

// parent relationship
export type AttachParentPayload =
  | { parentId: string }
  | { parentUserId: number }
  | { parentEmail: string; createIfMissing?: boolean };

export async function attachParentToPlayer(
  playerId: string | number,
  body: AttachParentPayload
) {
  const { data } = await api.post(`/players/${playerId}/parents`, body);
  return data;
}

export async function detachParentFromPlayer(
  playerId: string | number,
  parentId: string | number
) {
  const { data } = await api.delete(`/players/${playerId}/parents/${parentId}`);
  return data;
}
=======
>>>>>>> events-tab
