import { api } from './Client';

type RecruitmentData = {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: 'player' | 'coach' | 'parent';
  type: 'team' | 'individual';

  // Team Info (if type === 'team')
  teamName?: string;
  headCoach?: string;
  teamNotes?: string;
  ageGroup?: string;

  // Individual Info (if type === 'individual')
  mostRecentTeam?: string;
  yearsExperience?: string;
  primaryPosition?: string;
  individualNotes?: string;
  playerAgeGroup?: string;
};

export async function submitRecruitment(data: RecruitmentData) {
  const response = await api.post('/recruitment', data);
  return response.data;
}
