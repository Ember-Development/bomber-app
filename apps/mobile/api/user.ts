const API_BASE = 'http://192.168.1.76:3000';

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/api/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  console.log('✅ Received users:', data);
  return data;
};
