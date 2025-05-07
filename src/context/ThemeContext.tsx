import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  secondaryText: '#666666',
  border: '#E1E1E1',
  primary: '#007AFF',
  success: '#2ecc71',
  error: '#e74c3c',
  buttonText: '#FFFFFF',
  buttonBackground: '#007AFF',
  headerBackground: 'transparent',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E5EA',
};

export const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  text: '#FFFFFF',
  secondaryText: '#AAAAAA',
  border: '#3D3D3D',
  primary: '#0A84FF',
  success: '#2ecc71',
  error: '#e74c3c',
  buttonText: '#FFFFFF',
  buttonBackground: '#0A84FF',
  headerBackground: 'transparent',
  tabBarBackground: '#1E1E1E',
  tabBarBorder: '#3D3D3D',
};

// Theme context type definitions
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof lightTheme;
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: lightTheme,
});

// Storage key
const THEME_STORAGE_KEY = '@theme_preference';

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');
  
  // Load saved preference from storage
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    })();
  }, []);
  
  // Toggle theme function
  const toggleTheme = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  // Current theme based on mode
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 