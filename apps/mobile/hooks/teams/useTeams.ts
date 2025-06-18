import { useQuery } from '@tanstack/react-query';
import { fetchTeams, getTeamById } from '../../api/teams/teams';
import { TeamFE } from '@bomber-app/database';

export const useTeams = () => {
  return useQuery<TeamFE[]>({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });
};

export const useTeamById = (id: string) => {
  return useQuery<TeamFE>({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id),
  });
};
