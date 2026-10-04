//(Expo Documentation.2024)
// This is the entry point for the tab layout of the app. 
// It defines the structure and behavior of the bottom tab 
// navigation using Expo Router's Tabs component.
//  The layout includes two main screens: "Home" and "Explore",
//  each with its own icon and title. 
// The active tab color is determined by the current color scheme 
// (light or dark mode), and a custom HapticTab component is
//  used for the tab bar buttons to provide haptic feedback 
// on user interaction.
import { Tabs } from 'expo-router';//creates bottom tab navigation for the app
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, //hides the header for all screens in the tab navigator
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
        <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Help',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bot.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
{/**
  References
  Expo Documentation.2024.Create a project. [online]  Available at: <https://docs.expo.dev/get-started/create-a-project/ > [Accessed 17 Aug. 2026].
  
  */}