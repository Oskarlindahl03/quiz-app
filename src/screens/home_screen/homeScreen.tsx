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
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAllQuizzes, deleteQuiz } from '../../services/quiz_service';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/context/AuthContext';

type Quiz = {
  _id: string;
  title: string;
  description?: string;
};

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
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

  const confirmDelete = useCallback((quiz: Quiz) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${quiz.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => handleDeleteQuiz(quiz._id) 
        }
      ]
    );
  }, [handleDeleteQuiz]);

  const renderQuizItem = ({ item, index }: { item: Quiz; index: number }) => (
    <TouchableOpacity
      style={[
        styles.quizItem,
        { backgroundColor: index % 2 === 0 ? '#E3D4ED' : '#D8F3DC' }
      ]}
      activeOpacity={0.8}
      onPress={() => router.push(`/quiz/${item._id}`)}
      onLongPress={() => confirmDelete(item)}
      delayLongPress={500}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.username}>@{user?.username || 'user'}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.footerTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.footerIcons}>
          <Ionicons name="chatbubble-outline" size={20} color="#555" />
          <Ionicons name="heart-outline" size={20} color="#555" style={styles.footerIcon} />
          <Ionicons name="share-social-outline" size={20} color="#555" style={styles.footerIcon} />
        </View>
      </View>
      {deletingQuizId === item._id && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.deletingText}>Deleting...</Text>
        </View>
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
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Medias</Text>
        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          <View style={[styles.segmentButton, styles.segmentButtonActive]}>
            <Text style={[styles.segmentText, styles.segmentTextActive]}>Following</Text>
          </View>
          <View style={styles.segmentButton}>
            <Text style={styles.segmentText}>Discover</Text>
          </View>
        </View>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 14,
    color: '#007AFF',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 2,
    height: 200,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  footerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginLeft: 16,
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
  },
  deletingText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default HomeScreen;