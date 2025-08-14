import React from 'react';
import RenderCards from '../components/render-content';

export default function FanProfile({ user, activeTab }: any) {
  // no TabBar for fans, but if design changes:
  if (activeTab === 'info') {
    return (
      <RenderCards
        data={[
          { label: 'Name', value: `${user?.fname} ${user?.lname}` },
          { label: 'Joined', value: user?.createdAt?.slice(0, 10) ?? 'N/A' },
        ]}
      />
    );
  }

  // default → contact only
  return (
    <RenderCards
      data={[
        { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
        { label: 'Phone', value: user?.phone ?? 'N/A', fullWidth: true },
      ]}
    />
  );
}
