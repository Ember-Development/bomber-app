import { api } from './api';

export interface AnalyticsData {
  totalPlayers: number;
  totalNotificationsSent: number;
  totalTeams: number;
  totalUsers: number;
}

export const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const response = await api.get('/analytics');
  return response.data;
};
