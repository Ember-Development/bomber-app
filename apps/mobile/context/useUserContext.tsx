import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserFE } from '@bomber-app/database';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';

const UserContext = createContext<{
  user: UserFE | undefined;
  refetch: () => void;
}>({
  user: undefined,
  refetch: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: useCurrentUser,
  });

  const user = data as UserFE | undefined;

  return (
    <UserContext.Provider value={{ user, refetch }}>
      {children}
    </UserContext.Provider>
  );
};
