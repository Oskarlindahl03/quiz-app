import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export type Quiz = {
  _id: string;
  title: string;
  description?: string;
};

interface QuizListProps {
  quizzes: Quiz[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDeleteQuiz?: (quizId: string) => void;
  deletingQuizId?: string | null;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  loading = false,
  refreshing = false,
  onRefresh,
  onDeleteQuiz,
  deletingQuizId,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();

  // Determine card colors based on theme
  const getCardBackgroundColor = (index: number) => {
    if (isDarkMode) {
      return index % 2 === 0 ? '#442C4A' : '#2C4A38'; // Dark mode equivalents
    } else {
      return index % 2 === 0 ? '#E3D4ED' : '#D8F3DC'; // Original light colors
    }
  };

  const renderQuizItem = ({ item, index }: { item: Quiz; index: number }) => (
    <TouchableOpacity
      style={[
        styles.quizItem,
        { backgroundColor: getCardBackgroundColor(index) }
      ]}
      activeOpacity={0.8}
      onPress={() => router.push(`/quiz/${item._id}`)}
      onLongPress={() => onDeleteQuiz && onDeleteQuiz(item._id)}
      delayLongPress={500}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? '#555' : '#ccc' }]} />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.username, { color: theme.secondaryText }]}>@{user?.username || 'user'}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.footerTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.footerIcons}>
          <Ionicons name="chatbubble-outline" size={20} color={theme.secondaryText} />
          <Ionicons name="heart-outline" size={20} color={theme.secondaryText} style={styles.footerIcon} />
          <Ionicons name="share-social-outline" size={20} color={theme.secondaryText} style={styles.footerIcon} />
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Show empty state when no quizzes are found
  if (quizzes.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="search-outline" size={70} color={theme.border} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Quizzes Found</Text>
        <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
          Try searching for something else
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[styles.listContent, { backgroundColor: theme.background }]}
      data={quizzes}
      renderItem={renderQuizItem}
      keyExtractor={(item) => item._id}
      refreshControl={
        onRefresh ? (
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
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
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 14,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  deletingText: {
    color: '#fff',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 