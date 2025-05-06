import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  
  // Hide tab bar for settings screen
  const shouldHideTabBar = pathname === '/(tabs)/settings';

  // Show loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#005bea" />
      </View>
    );
  }

  // If not authenticated, don't render tabs
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarShowLabel: false,
        tabBarStyle: shouldHideTabBar ? { display: 'none' } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-quiz"
        options={{
          title: 'Create Quiz',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: null, // This hides it from the tab bar but keeps it in the navigation
        }}
      />
    </Tabs>
  );
} 