import React from 'react';
import { View, Text } from 'react-native';
import RenderCards, { CardItem } from '../components/render-content';
import { styles } from '@/styles/ProfileTabsStyle';

export default function ParentProfile({
  user,
  activeTab,
  setEditPlayerId,
  setRemovePlayerId,
  setSelectedProfile,
}: any) {
  // 1️⃣ Info
  if (activeTab === 'info') {
    return (
      <RenderCards
        data={[
          { label: 'Your Name', value: `${user?.fname} ${user?.lname}` },
          { label: 'Children', value: `${user.parent.children.length}` },
          { label: 'Role', value: 'Parent', fullWidth: true },
        ]}
      />
    );
  }

  // 2️⃣ Players
  if (activeTab === 'players') {
    return (
      <View style={{ marginTop: 20 }}>
        <RenderCards
          data={[
            {
              label: 'Player Teams',
              value:
                [
                  ...new Set(
                    user.parent.children
                      .map((ch: any) => ch.team?.name)
                      .filter(Boolean)
                  ),
                ].join(', ') || 'N/A',
              fullWidth: true,
            },
          ]}
        />
        <Text style={styles.sectionTitle}>My Athletes</Text>
        <RenderCards
          data={user.parent.children.map((c: any) => ({
            label: `${c.user?.fname ?? ''} ${c.user?.lname ?? ''}`.trim(),
            value: `#${c.jerseyNum}`,
            fullWidth: true,
            player: c,
            onEdit: () => setEditPlayerId(c.id),
            onRemove: () => setRemovePlayerId(c.id),
          }))}
          onSelectPlayer={(p) => setSelectedProfile(p)}
        />
      </View>
    );
  }

  // 3️⃣ Contact
  if (activeTab === 'contact') {
    return (
      <RenderCards
        data={[
          { label: 'Email', value: user?.email ?? 'N/A', fullWidth: true },
          { label: 'Phone', value: user?.phone ?? 'N/A', fullWidth: true },
          {
            label: 'Street Address',
            value: user.parent.address
              ? `${user.parent.address.address1} ${user.parent.address.address2 ?? ''}`.trim()
              : 'N/A',
            fullWidth: true,
          },
          { label: 'City', value: user.parent.address?.city ?? 'N/A' },
          { label: 'State', value: user.parent.address?.state ?? 'N/A' },
          { label: 'Zipcode', value: user.parent.address?.zip ?? 'N/A' },
        ]}
      />
    );
  }

  return null;
}
