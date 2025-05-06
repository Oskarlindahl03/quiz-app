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

  // Render a search result item
  const renderSearchResult = ({ item }: { item: Quiz }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigateToQuiz(item._id)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.resultDescription}>{item.description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
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
            renderItem={renderSearchResult}
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
    backgroundColor: '#FFFDE7', // Consistent with app theme
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
    color: '#F15BB5', // Consistent with app theme
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
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
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