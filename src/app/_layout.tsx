import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ProfileProvider } from '../context/ProfileContext';
import { useEffect } from 'react';

export default function RootLayout() {
  // Add logging to debug navigation
  useEffect(() => {
    console.log('[RootLayout] Mounted');
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ProfileProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="index" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="(auth)" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{ headerShown: false }} 
            />
          </Stack>
        </ProfileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
} 