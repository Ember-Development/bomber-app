import React, { createContext, useContext, useState } from 'react';
import { PlayerSignupData } from './PlayerSignupContext';

type MultiPlayerSignupContextType = {
  players: PlayerSignupData[];
  addPlayer: (player: PlayerSignupData) => void;
  resetPlayers: () => void;
};

const MultiPlayerSignupContext = createContext<
  MultiPlayerSignupContextType | undefined
>(undefined);

export const MultiPlayerSignupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [players, setPlayers] = useState<PlayerSignupData[]>([]);

  const addPlayer = (player: PlayerSignupData) => {
    setPlayers((prev) => [...prev, player]);
  };

  const resetPlayers = () => {
    setPlayers([]);
  };

  return (
    <MultiPlayerSignupContext.Provider
      value={{ players, addPlayer, resetPlayers }}
    >
      {children}
    </MultiPlayerSignupContext.Provider>
  );
};

export const useMultiPlayerSignup = () => {
  const context = useContext(MultiPlayerSignupContext);
  if (!context)
    throw new Error(
      'useMultiPlayerSignup must be used within MultiPlayerSignupProvider'
    );
  return context;
};
