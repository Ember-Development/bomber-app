const API_BASE = 'http://192.168.1.76:3000';

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/api/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  console.log('✅ Received users:', data);
  return data;
};

export const fetchUserEvents = async (userId: string) => {
  const res = await fetch(`${API_BASE}/api/users/${userId}/events`);
  if (!res.ok) throw new Error('Failed to fetch user events');
  const data = await res.json();
  console.log('✅ Received user events:', data);
  return data;
};

export const fetchUserChats = async (userId: string) => {
  const res = await fetch(`${API_BASE}/api/users/${userId}/chats`);
  if (!res.ok) throw new Error('Failed to fetch user chats');
  const data = await res.json();
  console.log('✅ Received user chats:', data);
  return data;
};
