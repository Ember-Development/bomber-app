import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser, CurrentUser } from '@/hooks/user/useCurrentUser';

const UserContext = createContext<{
  user: CurrentUser | undefined;
  refetch: () => void;
}>({
  user: undefined,
  refetch: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data, refetch } = useQuery<CurrentUser | undefined>({
    queryKey: ['currentUser'],
    queryFn: useCurrentUser,
  });

  return (
    <UserContext.Provider value={{ user: data, refetch }}>
      {children}
    </UserContext.Provider>
  );
};
