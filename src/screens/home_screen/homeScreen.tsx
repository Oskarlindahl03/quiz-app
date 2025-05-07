import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator, 
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAllQuizzes, deleteQuiz } from '../../services/quiz_service';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { QuizList, Quiz } from '../../components/QuizList';

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const data = await getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchQuizzes();
      return () => {
        // Clean up if needed
      };
    }, [fetchQuizzes])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDeleteQuiz = useCallback(async (quizId: string) => {
    try {
      setDeletingQuizId(quizId);
      await deleteQuiz(quizId);
      // Remove from local state
      setQuizzes(currentQuizzes => currentQuizzes.filter(quiz => quiz._id !== quizId));
      Alert.alert('Success', 'Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      Alert.alert('Error', 'Failed to delete quiz');
    } finally {
      setDeletingQuizId(null);
    }
  }, []);

  const confirmDelete = useCallback((quizId: string) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (!quiz) return;

    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${quiz.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => handleDeleteQuiz(quizId) 
        }
      ]
    );
  }, [quizzes, handleDeleteQuiz]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Medias</Text>
        {/* Segmented Control */}
        <View style={[styles.segmentContainer, { backgroundColor: theme.surface }]}>
          <View style={[styles.segmentButton, styles.segmentButtonActive, { backgroundColor: theme.card }]}>
            <Text style={[styles.segmentText, styles.segmentTextActive, { color: theme.primary }]}>Following</Text>
          </View>
          <View style={styles.segmentButton}>
            <Text style={[styles.segmentText, { color: theme.secondaryText }]}>Discover</Text>
          </View>
        </View>
      </View>
      <QuizList
        quizzes={quizzes}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onDeleteQuiz={confirmDelete}
        deletingQuizId={deletingQuizId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 8,
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  segmentButtonActive: {
    // backgroundColor set dynamically with theme
  },
  segmentText: {
    fontSize: 14,
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;