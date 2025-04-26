import { Platform, Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRef } from 'react';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground children={undefined} />,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            height: 70,
          },
          default: {
            height: 70,
          },
        }),
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 6,
          width: '100%',
          height: '100%',
        },
        tabBarLabelStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="component"
        options={{
          title: 'Components',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="construct" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="chatbox" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function AnimatedIcon({
  name,
  color,
  focused,
}: {
  name: any;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  if (focused) {
    Animated.spring(scale, {
      toValue: 1.2,
      friction: 4,
      useNativeDriver: true,
    }).start();
  } else {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={20} color={color} />
    </Animated.View>
  );
}
