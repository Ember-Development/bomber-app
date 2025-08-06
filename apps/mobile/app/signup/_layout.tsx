import { PlayerSignupProvider } from '@/context/PlayerSignupContext';
import { CoachSignupProvider } from '@/context/CoachSignupContext';
import { ParentSignupProvider } from '@/context/ParentSignupContext';
import { Slot } from 'expo-router';
import { MultiPlayerSignupProvider } from '@/context/MultiPlayerContext';

export default function SignupLayout() {
  return (
    <MultiPlayerSignupProvider>
      <PlayerSignupProvider>
        <CoachSignupProvider>
          <ParentSignupProvider>
            <Slot />
          </ParentSignupProvider>
        </CoachSignupProvider>
      </PlayerSignupProvider>
    </MultiPlayerSignupProvider>
  );
}
