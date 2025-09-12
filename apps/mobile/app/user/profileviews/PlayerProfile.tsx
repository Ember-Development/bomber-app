import React from 'react';
import RenderCards from '../components/render-content';
import {
  formatAgeGroup,
  formatPantSize,
  formatPosition,
} from '@/utils/enumOptions';

export default function PlayerProfile({ user, activeTab }: any) {
  if (activeTab === 'info') {
    return (
      <RenderCards
        data={[
          {
            label: 'Team',
            value: user?.player?.team?.name ?? 'N/A',
            fullWidth: true,
          },
          { label: 'Grad Year', value: user?.player?.gradYear ?? 'N/A' },
          {
            label: 'Age Group',
            value: formatAgeGroup(user?.player?.ageGroup) ?? 'N/A',
          },
          {
            label: 'Primary Position',
            value: formatPosition(user?.player?.pos1) ?? 'N/A',
          },
          {
            label: 'Secondary Position',
            value: formatPosition(user?.player?.pos2) ?? 'N/A',
          },
          {
            label: 'College Commitment',
            value: user?.player?.college ?? 'Uncommitted',
            fullWidth: true,
          },
        ]}
      />
    );
  }

  if (activeTab === 'contact') {
    return (
      <RenderCards
        data={[
          { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
          { label: 'Phone', value: user?.phone ?? 'N/A' },
          { label: 'Date of Birth', value: user?.player?.dob ?? 'N/A' },
          {
            label: 'Street Address',
            value: user?.player?.address
              ? `${user.player.address.address1} ${user.player.address.address2 ?? ''}`.trim()
              : 'N/A',
            fullWidth: true,
          },
          { label: 'City', value: user?.player?.address?.city ?? 'N/A' },
          { label: 'State', value: user?.player?.address?.state ?? 'N/A' },
          {
            label: 'Zipcode',
            value: user?.player?.address?.zip ?? 'N/A',
            fullWidth: true,
          },
        ]}
      />
    );
  }

  if (activeTab === 'gear') {
    const gearItems = [
      { label: 'Jersey Size', value: user?.player?.jerseySize ?? 'N/A' },
      { label: 'Pant Size', value: formatPantSize(user?.player?.pantSize) },
      { label: 'Stirrup Size', value: user?.player?.stirrupSize ?? 'N/A' },
      { label: 'Short Size', value: user?.player?.shortSize ?? 'N/A' },
      {
        label: 'Practice Shirt Size',
        value: user?.player?.practiceShortSize ?? 'N/A',
      },
    ];
    if (gearItems.length % 2 !== 0) {
      gearItems[gearItems.length - 1].fullWidth = true;
    }
    return <RenderCards data={gearItems} />;
  }

  return null;
}
