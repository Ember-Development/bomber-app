// in src/constants/quickActions.ts
import { Role } from '@/types';
import { Alert } from 'react-native';

export type QuickAction = {
  title: string;
  icon: any;
  onPress: () => void;
};

const payments: QuickAction = {
  title: 'Payments',
  icon: require('@/assets/images/react-logo.png'),
  onPress: () => Alert.alert('Payments Clicked!'),
};
const myTeams: QuickAction = {
  title: 'My Teams',
  icon: require('@/assets/images/react-logo.png'),
  onPress: () => Alert.alert('My Teams Clicked!'),
};
const myPlayers: QuickAction = {
  title: 'My Players',
  icon: require('@/assets/images/react-logo.png'),
  onPress: () => Alert.alert('My Players Clicked!'),
};
const myProfile: QuickAction = {
  title: 'My Profile',
  icon: require('@/assets/images/react-logo.png'),
  onPress: () => Alert.alert('My Profile Clicked!'),
};
const shopBombers: QuickAction = {
  title: 'Shop Bombers',
  icon: require('@/assets/images/react-logo.png'),
  onPress: () => Alert.alert('Shop Bombers Clicked!'),
};
const bomberTeams: QuickAction = {
  title: 'Bomber Teams',
  icon: require('@/assets/images/react-logo.png'),
  onPress: () => Alert.alert('Bomber Teams Clicked!'),
};
const myRegion: QuickAction = {
  title: 'My Region',
  icon: require('@/assets/images/react-logo.png'),
  onPress: () => Alert.alert('My Region Clicked!'),
};

export const quickActionMap: Record<Role, QuickAction[]> = {
  COACH: [payments, myTeams],
  PARENT: [payments, myPlayers],
  PLAYER: [myProfile, myTeams],
  FAN: [shopBombers, bomberTeams],
  REGIONAL_COACH: [payments, myRegion],
  ADMIN: [payments, myTeams /*…whatever*/],
};
