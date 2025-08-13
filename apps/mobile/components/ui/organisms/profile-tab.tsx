import React from 'react';
import { ScrollView } from 'react-native';
import { TabBar, TabItem } from './TabBar';
import CoachProfile from '../../../app/user/profileviews/CoachProfile';
import RegionalCoachProfile from '../../../app/user/profileviews/RegionalCoachProfile';
import ParentProfile from '../../../app/user/profileviews/ParentProfile';
import FanProfile from '../../../app/user/profileviews/FanProfile';
import PlayerProfile from '../../../app/user/profileviews/PlayerProfile';
import ModalManager from '../../../app/user/components/modalmanager';
import { ProfileTab, useProfileTabs } from '../../../hooks/useProfileTabs';
import AdminProfile from '@/app/user/profileviews/AdminProfile';

// ProfileTabs.tsx
export default function ProfileTabs() {
  const hook = useProfileTabs();
  const {
    primaryRole,
    isCoach,
    isFan,
    isRegionalCoach,
    hasParentRecord,
    isParentView,
    activeTab,
    setActiveTab,
  } = hook;

  const isAdmin = primaryRole === 'ADMIN';

  const items: TabItem[] = [
    {
      key: 'info' as ProfileTab,
      label:
        isCoach || isRegionalCoach || isAdmin
          ? 'Team'
          : isAdmin
            ? 'Info'
            : 'Info',
    },
    ...(hasParentRecord
      ? [{ key: 'players' as ProfileTab, label: 'Players' }]
      : []),
    { key: 'contact' as ProfileTab, label: 'Contact' },
    ...(!isCoach && !isParentView && !isAdmin
      ? [{ key: 'gear' as ProfileTab, label: 'Gear' }]
      : []),
    ...(isRegionalCoach || isAdmin
      ? [
          {
            key: 'region' as ProfileTab,
            label: isAdmin ? 'All Teams' : 'Region',
          },
        ]
      : []),
  ];

  let BodyComponent: React.ComponentType<any>;
  switch (primaryRole) {
    case 'COACH':
      BodyComponent = CoachProfile;
      break;
    case 'REGIONAL_COACH':
      BodyComponent = RegionalCoachProfile;
      break;
    case 'PARENT':
      BodyComponent = ParentProfile;
      break;
    case 'FAN':
      BodyComponent = FanProfile;
      break;
    case 'ADMIN':
      BodyComponent = AdminProfile;
      break;
    default:
      BodyComponent = PlayerProfile;
  }

  return (
    <>
      {!isFan && (
        <TabBar
          items={items}
          activeKey={activeTab}
          onTabPress={(key) => setActiveTab(key)}
        />
      )}
      <ScrollView>
        <BodyComponent {...hook} />
      </ScrollView>
      <ModalManager {...hook} />
    </>
  );
}
