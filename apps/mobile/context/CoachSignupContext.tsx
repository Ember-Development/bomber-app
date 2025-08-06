import React, { createContext, useContext, useState } from 'react';

export type CoachSignupData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  password?: string;
  confirmPassword?: string;

  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;

  teamCode?: string;
  teamName?: string;
  ageDivision?: string;
};

type CoachSignupContextType = {
  signupData: CoachSignupData;
  setSignupData: (data: Partial<CoachSignupData>) => void;
  updateSignupData: (data: Partial<CoachSignupData>) => void;
  resetSignupData: () => void;
};

const CoachSignupContext = createContext<CoachSignupContextType | undefined>(
  undefined
);

export const CoachSignupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [signupData, setSignupState] = useState<CoachSignupData>({});

  const setSignupData = (data: Partial<CoachSignupData>) => {
    setSignupState((prev) => ({ ...prev, ...data }));
  };

  const updateSignupData = (data: Partial<CoachSignupData>) => {
    setSignupState((prev) => ({ ...prev, ...data }));
  };

  const resetSignupData = () => setSignupState({});

  return (
    <CoachSignupContext.Provider
      value={{ signupData, setSignupData, updateSignupData, resetSignupData }}
    >
      {children}
    </CoachSignupContext.Provider>
  );
};

export const useCoachSignup = () => {
  const context = useContext(CoachSignupContext);
  if (!context) {
    throw new Error('useCoachSignup must be used within CoachSignupProvider');
  }
  return context;
};
