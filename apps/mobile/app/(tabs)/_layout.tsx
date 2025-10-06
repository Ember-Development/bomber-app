import React, { useRef } from 'react';
import { Platform, Animated, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, GlobalColors } from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useUserContext } from '@/context/useUserContext';

export default function TabLayout() {
  const { user } = useUserContext();
  const primaryRole = Array.isArray(user?.primaryRole)
    ? user.primaryRole[0]
    : (user?.primaryRole ?? '');
  const isFan = primaryRole.toUpperCase() === 'FAN';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GlobalColors.bomber,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
          elevation: 0,
        },
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
      {/* Home: everyone */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />
<<<<<<< HEAD

      {/* Shop: everyone */}
      {/* <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name="pricetag-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
=======
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />

      {/* Shop: everyone */}
      {/* <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name="pricetag-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
>>>>>>> events-tab
      /> */}

      {/* groups: only non-Fans */}
      {/* {!isFan && (
        <Tabs.Screen
          name="groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedIcon
                name="chatbox-outline"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      )} */}

      {/* Events: only non-Fans */}
      {/* {!isFan && (
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedIcon
                name="calendar-outline"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      )} */}

      {/* Media: only Fans */}
      <Tabs.Screen
        name="media"
        options={{
          title: 'Media',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name="play-circle-outline"
              color={color}
              focused={focused}
            />
          ),
          // hide from the tab bar & routing when not Fan
          href: !isFan ? null : undefined,
        }}
      />

      {/* Profile: everyone */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              name="person-outline"
              color={color}
              focused={focused}
            />
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
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.iconWrapper, { transform: [{ scale }] }]}>
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
