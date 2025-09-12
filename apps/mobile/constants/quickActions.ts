import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Role } from '@/types';

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type QuickAction = {
  title: string;
  iconName: IoniconName;
  onPress: () => void;
};

export function useQuickActions(role: Role): QuickAction[] {
  const router = useRouter();

  const payments: QuickAction = {
    title: 'Payments',
    iconName: 'card-outline',
    onPress: () => {
      Linking.openURL('https://bomberpayments.net').catch(console.error);
    },
  };

  const shopBombers: QuickAction = {
    title: 'Shop Bombers',
    iconName: 'shirt-outline',
    onPress: () => {
      Linking.openURL('https://bomberswebstore.com').catch(console.error);
    },
  };

  const myTeams: QuickAction = {
    title: 'My Teams',
    iconName: 'people-outline',
    onPress: () => router.push('/teams'),
  };

  const myPlayers: QuickAction = {
    title: 'My Players',
    iconName: 'person-outline',
    onPress: () => router.push('/profile'),
  };

  const myProfile: QuickAction = {
    title: 'My Profile',
    iconName: 'person-circle-outline',
    onPress: () => router.push('/profile'),
  };

  const bomberTeams: QuickAction = {
    title: 'Bomber Teams',
    iconName: 'shield-outline',
    onPress: () => router.push('/teams'),
  };

  const myRegion: QuickAction = {
    title: 'My Region',
    iconName: 'map-outline',
    onPress: () => router.push('/profile'),
  };

  const map: Record<Role, QuickAction[]> = {
    COACH: [payments, shopBombers],
    PARENT: [payments, shopBombers],
    PLAYER: [myProfile, shopBombers],
    FAN: [bomberTeams, shopBombers],
    REGIONAL_COACH: [payments, shopBombers],
    ADMIN: [bomberTeams, shopBombers],
  };

  return map[role] || [];
}
