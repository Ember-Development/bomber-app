import React, { createContext, useContext, useState } from 'react';

export type PlayerSignupData = {
  role?: string;
  teamCode?: string;
  ageDivision?: string;

  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
  state?: string;
  city?: string;
  zip?: string;

  position1?: string;
  position2?: string;
  jersey?: string;
  gradYear?: string;
  committed?: boolean;
  college?: string;

  jerseySize?: string;
  pantSize?: string;
  stirrupSize?: string;
  shortSize?: string;
  practiceShirtSize?: string;
};

type PlayerSignupContextType = {
  signupData: PlayerSignupData;
  setSignupData: (data: Partial<PlayerSignupData>) => void;
  resetSignupData: () => void;
};

const PlayerSignupContext = createContext<PlayerSignupContextType | undefined>(
  undefined
);

export const PlayerSignupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [signupData, setSignupState] = useState<PlayerSignupData>({});

  const setSignupData = (data: Partial<PlayerSignupData>) => {
    setSignupState((prev) => ({ ...prev, ...data }));
  };

  const resetSignupData = () => setSignupState({});

  return (
    <PlayerSignupContext.Provider
      value={{ signupData, setSignupData, resetSignupData }}
    >
      {children}
    </PlayerSignupContext.Provider>
  );
};

export const usePlayerSignup = () => {
  const context = useContext(PlayerSignupContext);
  if (!context)
    throw new Error('usePlayerSignup must be used within PlayerSignupProvider');
  return context;
};
