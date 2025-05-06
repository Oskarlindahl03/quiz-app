import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { getAllQuizzes } from '../../services/quiz_service';
import { useAuth } from '@/context/AuthContext';

type Quiz = {
  _id: string;
  title: string;
  description?: string;
};

/**
 * SearchScreen Component
 * 
 * Provides search functionality for quizzes.
 * This implementation includes a search bar and results display area.
 */
const SearchScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  // State for search query and results
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  
  // Fetch all quizzes when component mounts
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzes = await getAllQuizzes();
        setAllQuizzes(quizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    
    fetchQuizzes();
  }, []);

  // Handle search submission
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Filter quizzes based on search query
    const results = allQuizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, allQuizzes]);

  // Update search results as user types
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);

  // Navigate to quiz detail
  const navigateToQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}` as any);
  };

  const renderQuizItem = ({ item, index }: { item: Quiz; index: number }) => (
    <TouchableOpacity
      style={[
        styles.quizItem,
        { backgroundColor: index % 2 === 0 ? '#E3D4ED' : '#D8F3DC' }
      ]}
      activeOpacity={0.8}
      onPress={() => router.push(`/quiz/${item._id}`)}
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quizzes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F15BB5" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderQuizItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length > 0 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={50} color="#ccc" />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>Try different keywords</Text>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="search-outline" size={70} color="#ccc" />
            <Text style={styles.emptyStateText}>Search for quizzes</Text>
            <Text style={styles.emptyStateSubtext}>Enter keywords to find what you're looking for</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F15BB5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsList: {
    paddingBottom: 20,
  },
  quizItem: {
    backgroundColor: '#FFFFFF',
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default SearchScreen; 