import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button, 
  StyleSheet,
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAllQuizzes } from '../../services/quiz_service';

type Quiz = {
  _id: string;
  title: string;
  description?: string;
};

const HomeScreen = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuizzes();
  }, [fetchQuizzes]);

  const renderQuizItem = ({ item }: { item: Quiz }) => (
    <TouchableOpacity
      style={styles.quizItem}
      onPress={() => router.push(`/quiz/${item._id}` as any)}
    >
      <Text style={styles.quizTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.quizDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005bea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;