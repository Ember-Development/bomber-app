import { api } from '../api';

export type CreateLeadPayload = {
  kind: 'PLAYER' | 'PARENT';
  playerFirstName: string;
  playerLastName: string;
  ageGroup: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18';
  pos1?: string;
  pos2?: string;
  gradYear?: string;
  email?: string;
  phone?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
};

export const createLead = async (payload: CreateLeadPayload) => {
  const { data } = await api.post('/api/portal/leads', payload);
  return data;
};
