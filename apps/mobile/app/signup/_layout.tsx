// app/signup/_layout.tsx
import { Stack } from 'expo-router';
import { PlayerSignupProvider } from '@/context/PlayerSignupContext';
import { CoachSignupProvider } from '@/context/CoachSignupContext';
import { ParentSignupProvider } from '@/context/ParentSignupContext';
import { MultiPlayerSignupProvider } from '@/context/MultiPlayerContext';

export default function SignupLayout() {
  return (
    <MultiPlayerSignupProvider>
      <PlayerSignupProvider>
        <CoachSignupProvider>
          <ParentSignupProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ParentSignupProvider>
        </CoachSignupProvider>
      </PlayerSignupProvider>
    </MultiPlayerSignupProvider>
  );
}
