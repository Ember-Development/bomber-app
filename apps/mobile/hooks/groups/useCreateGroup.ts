import { useMutation } from '@tanstack/react-query';

const API_BASE = 'http://192.168.1.76:3000';

const createGroup = async ({
  title,
  userIds,
}: {
  title: string;
  userIds: string[];
}) => {
  const res = await fetch(`${API_BASE}/api/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, userIds }),
  });

  if (!res.ok) throw new Error('Failed to create group');
  return res.json();
};

export const useCreateGroup = () => {
  return useMutation({
    mutationFn: createGroup,
  });
};
