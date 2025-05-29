import React from 'react';
import { View, Text } from 'react-native';

const InfoTag = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      backgroundColor: '#eee',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    }}
  >
    <Text style={{ fontWeight: '500', fontSize: 13 }}>
      {label}: {value}
    </Text>
  </View>
);

export default InfoTag;
