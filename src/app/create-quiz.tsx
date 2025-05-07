import React from 'react';
import { View } from 'react-native';
import CreateQuizScreenMVP from '../screens/create_post_screen/CreateQuizScreen';
import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function CreateQuiz() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CreateQuizScreenMVP />
    </View>
  );
} 