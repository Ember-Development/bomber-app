import { Role } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type QuickAction = {
  title: string;
  iconName: IoniconName;
  onPress: () => void;
};

const payments: QuickAction = {
  title: 'Payments',
  iconName: 'card-outline',
  onPress: () => Alert.alert('Payments Clicked!'),
};
const myTeams: QuickAction = {
  title: 'My Teams',
  iconName: 'people-outline',
  onPress: () => Alert.alert('My Teams Clicked!'),
};
const myPlayers: QuickAction = {
  title: 'My Players',
  iconName: 'person-outline',
  onPress: () => Alert.alert('My Players Clicked!'),
};
const myProfile: QuickAction = {
  title: 'My Profile',
  iconName: 'person-circle-outline',
  onPress: () => Alert.alert('My Profile Clicked!'),
};
const shopBombers: QuickAction = {
  title: 'Shop Bombers',
  iconName: 'shirt-outline',
  onPress: () => Alert.alert('Shop Bombers Clicked!'),
};
const bomberTeams: QuickAction = {
  title: 'Bomber Teams',
  iconName: 'shield-outline',
  onPress: () => Alert.alert('Bomber Teams Clicked!'),
};
const myRegion: QuickAction = {
  title: 'My Region',
  iconName: 'map-outline',
  onPress: () => Alert.alert('My Region Clicked!'),
};

export const quickActionMap: Record<Role, QuickAction[]> = {
  COACH: [payments, shopBombers],
  PARENT: [payments, shopBombers],
  PLAYER: [myProfile, shopBombers],
  FAN: [bomberTeams, shopBombers],
  REGIONAL_COACH: [payments, shopBombers],
  ADMIN: [bomberTeams, shopBombers],
};
