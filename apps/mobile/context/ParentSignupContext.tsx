import React, { createContext, useContext, useState, ReactNode } from 'react';

type ParentSignupData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  teamCode?: string;
  parentId?: string;
  addressID?: string;
};

type ParentSignupContextType = {
  signupData: ParentSignupData;
  setSignupData: (data: Partial<ParentSignupData>) => void;
  updateSignupData: (data: Partial<ParentSignupData>) => void;
  resetSignupData: () => void;
};

const ParentSignupContext = createContext<ParentSignupContextType | undefined>(
  undefined
);

export const ParentSignupProvider = ({ children }: { children: ReactNode }) => {
  const [signupData, setData] = useState<ParentSignupData>({});

  const setSignupData = (data: Partial<ParentSignupData>) => {
    setData((prev) => ({ ...prev, ...data }));
  };

  const updateSignupData = (data: Partial<ParentSignupData>) => {
    setData((prev) => ({ ...prev, ...data }));
  };

  const resetSignupData = () => {
    setData({});
  };

  return (
    <ParentSignupContext.Provider
      value={{ signupData, setSignupData, updateSignupData, resetSignupData }}
    >
      {children}
    </ParentSignupContext.Provider>
  );
};

export const useParentSignup = () => {
  const context = useContext(ParentSignupContext);
  if (!context) {
    throw new Error('useParentSignup must be used within ParentSignupProvider');
  }
  return context;
};
