import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import { UserFE } from '@bomber-app/database';

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
  const { data, refetch } = useQuery<UserFE | undefined>({
    queryKey: ['currentUser'],
    queryFn: useCurrentUser,
  });

  return (
    <UserContext.Provider value={{ user: data, refetch }}>
      {children}
    </UserContext.Provider>
  );
};
