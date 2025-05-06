import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import InQuizGameScreen from '../../screens/quiz_screen/InQuizGameScreen';
import { View, StyleSheet } from 'react-native';

export default function QuizPage() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  
  return (
    <View style={styles.container}>
      <InQuizGameScreen quizId={quizId as string} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 