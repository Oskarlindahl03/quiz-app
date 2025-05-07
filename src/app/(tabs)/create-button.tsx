import React from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

// This component will redirect to create-quiz-options if accessed directly
export default function CreateButton() {
  return <Redirect href="/create-quiz-options" />;
} 