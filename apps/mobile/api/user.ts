import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/api/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  console.log('✅ Received users:', data);
  return data;
};
