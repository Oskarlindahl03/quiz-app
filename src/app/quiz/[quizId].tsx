import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import InQuizGameScreen from '../../screens/quiz_screen/InQuizGameScreen';
import { View, StyleSheet } from 'react-native';

export default function QuizPage() {
  // Get both quizId and key from URL params
  const { quizId, key } = useLocalSearchParams<{ quizId: string, key: string }>();
  
  // Add a unique key to force the component to remount
  return (
    <View style={styles.container}>
      <InQuizGameScreen 
        key={key || quizId} 
        quizId={quizId as string} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 