import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import QuizPreviewScreen from '../../../screens/quiz_screen/QuizPreviewScreen';
import { View, StyleSheet } from 'react-native';

export default function QuizPreviewPage() {
  // Get quizId from URL params
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  
  // Handle navigation to prevent going back to the quiz page
  useEffect(() => {
    // Handle iOS nav history
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If the user is trying to go back with a gesture or button
      if (e.data.action.type === 'GO_BACK') {
        // Prevent default back behavior
        e.preventDefault();
        
        // Navigate to home instead
        router.replace('/');
      }
    });

    return unsubscribe;
  }, [navigation, router]);
  
  return (
    <View style={styles.container}>
      <QuizPreviewScreen quizId={quizId as string} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 