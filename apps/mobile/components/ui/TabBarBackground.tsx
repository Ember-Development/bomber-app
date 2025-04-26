// TabBarBackground.tsx
import { View } from 'react-native';
import React, { ReactNode } from 'react';

const TabBarBackground = ({ children }: { children: ReactNode }) => {
  console.log('TabBarBackground children:', children);

  return <View>{children}</View>;
};

export default TabBarBackground;
