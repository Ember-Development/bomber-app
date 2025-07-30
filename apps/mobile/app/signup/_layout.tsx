import { PlayerSignupProvider } from '@/context/PlayerSignupContext';
import { Slot } from 'expo-router';

export default function SignupLayout() {
  return (
    <PlayerSignupProvider>
      <Slot />
    </PlayerSignupProvider>
  );
}
