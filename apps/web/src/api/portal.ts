import { api } from './api';

export type LeadKind = 'PLAYER' | 'PARENT';
export type AgeGroup = 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'ALUMNI';
export type Position =
  | 'PITCHER'
  | 'CATCHER'
  | 'FIRST_BASE'
  | 'SECOND_BASE'
  | 'THIRD_BASE'
  | 'SHORTSTOP'
  | 'LEFT_FIELD'
  | 'CENTER_FIELD'
  | 'RIGHT_FIELD'
  | 'DESIGNATED_HITTER';

export type PortalLeadFE = {
  id: string;
  kind: LeadKind;

  playerFirstName: string;
  playerLastName: string;
  ageGroup: AgeGroup;
  pos1?: Position | null;
  pos2?: Position | null;
  gradYear?: string | null;

  parentFirstName?: string | null;
  parentLastName?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;

  email?: string | null;
  phone?: string | null;

  createdAt: string; // ISO
  convertedPlayerId?: string | null;
};

export type CreateLeadInput = {
  kind: LeadKind;
  playerFirstName: string;
  playerLastName: string;
  ageGroup: AgeGroup;
  pos1?: Position;
  pos2?: Position;
  gradYear?: string;

  email?: string;
  phone?: string;

  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
};

export async function fetchPortalLeads(): Promise<PortalLeadFE[]> {
  const { data } = await api.get<PortalLeadFE[]>('/portal/leads');
  return data;
}

export async function createPortalLead(
  payload: CreateLeadInput
): Promise<PortalLeadFE> {
  const { data } = await api.post<PortalLeadFE>('/portal/leads', payload);
  return data;
}
