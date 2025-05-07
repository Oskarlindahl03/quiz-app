import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
  ScrollView
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { getAllQuizzes } from '../../services/quiz_service';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { QuizList, Quiz } from '../../components/QuizList';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@recent_searches';
const INITIAL_RECENT_SEARCHES = 5;

/**
 * SearchScreen Component
 * 
 * Provides search functionality for quizzes.
 * This implementation includes a search bar and results display area.
 */
const SearchScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Quiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Quiz[]>([]);
  const [showAllRecentSearches, setShowAllRecentSearches] = useState(false);
  
  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const newSearches = [query, ...recentSearches.filter(s => s !== query)];
      setRecentSearches(newSearches);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const removeRecentSearch = async (query: string) => {
    try {
      const newSearches = recentSearches.filter(s => s !== query);
      setRecentSearches(newSearches);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

    const fetchQuizzes = async () => {
      try {
        const quizzes = await getAllQuizzes();
        setAllQuizzes(quizzes);
      // Always ensure we set all quizzes as the default search results
      setSearchResults(quizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
    } finally {
      setRefreshing(false);
      }
    };
    
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSearch = useCallback(() => {
    // If search query is empty, show all quizzes
    if (!searchQuery.trim()) {
      setSearchResults(allQuizzes);
      
      // Return to quiz list view if needed
      if (isSearchFocused) {
        setIsSearchFocused(false);
        Keyboard.dismiss();
      }
      return;
    }
    
    setIsSearching(true);
    
    const results = allQuizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
    
    // Save to recent searches if there are results and dismiss keyboard
    if (results.length > 0) {
      saveRecentSearch(searchQuery.trim());
    }
    
    // Return to quiz list view but keep the search query
    if (isSearchFocused) {
      setIsSearchFocused(false);
      Keyboard.dismiss();
    }
  }, [searchQuery, allQuizzes, isSearchFocused]);

  // Update search suggestions as user types
  useEffect(() => {
    if (searchQuery.trim()) {
      const suggestions = allQuizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, allQuizzes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuizzes();
  }, []);

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    
    // Filter quizzes based on the selected recent search
    const results = allQuizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(query.toLowerCase())
    );
    
    // Set the search results
    setSearchResults(results);
    
    // Exit search mode and show results
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (quiz: Quiz) => {
    setSearchQuery(quiz.title);
    
    // For suggestions, we can directly set the single quiz as the result
    // or filter all quizzes to find matches (which would include the clicked suggestion)
    const results = allQuizzes.filter(q => 
      q.title.toLowerCase().includes(quiz.title.toLowerCase())
    );
    
    // Set the search results
    setSearchResults(results);

    // Save to recent searches
    saveRecentSearch(quiz.title.trim());
    
    // Exit search mode and show results
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.recentSearchItem, { borderBottomColor: theme.border }]}
      onPress={() => handleRecentSearchPress(item)}
    >
      <Ionicons name="time-outline" size={20} color={theme.secondaryText} style={styles.recentSearchIcon} />
      <Text style={[styles.recentSearchText, { color: theme.text }]}>{item}</Text>
      <TouchableOpacity
        onPress={() => removeRecentSearch(item)}
        style={styles.removeRecentSearch}
      >
        <Ionicons name="close" size={20} color={theme.secondaryText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }: { item: Quiz }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons name="search-outline" size={20} color={theme.secondaryText} style={styles.suggestionIcon} />
      <Text style={[styles.suggestionText, { color: theme.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSearchSuggestions = () => (
    <View style={[styles.suggestionsContainer, { backgroundColor: theme.card }]}>
      <View style={styles.suggestionsHeader}>
        <Text style={[styles.suggestionsTitle, { color: theme.text }]}>Suggestions</Text>
      </View>
      <FlatList
        data={searchSuggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(item) => item._id}
        style={styles.suggestionsList}
      />
    </View>
  );

  const renderRecentSearches = () => {
    const displayedSearches = showAllRecentSearches 
      ? recentSearches 
      : recentSearches.slice(0, INITIAL_RECENT_SEARCHES);

    return (
      <View style={[styles.recentSearchesContainer, { backgroundColor: theme.card }]}>
        <View style={styles.recentSearchesHeader}>
          <Text style={[styles.recentSearchesTitle, { color: theme.text }]}>Recent Searches</Text>
          {recentSearches.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setRecentSearches([]);
                AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
              }}
            >
              <Text style={[styles.clearAllText, { color: theme.primary }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        {recentSearches.length > 0 ? (
          <FlatList
            data={displayedSearches}
            renderItem={renderRecentSearchItem}
            keyExtractor={(item) => item}
            style={styles.recentSearchesList}
            ListFooterComponent={
              recentSearches.length > INITIAL_RECENT_SEARCHES && !showAllRecentSearches ? (
                <TouchableOpacity
                  style={[styles.seeMoreButton, { borderTopColor: theme.border }]}
                  onPress={() => setShowAllRecentSearches(true)}
                >
                  <Text style={[styles.seeMoreText, { color: theme.primary }]}>See More</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="search-outline" size={70} color={theme.border} />
            <Text style={[styles.emptyStateText, { color: theme.text }]}>No Recent Searches</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.secondaryText }]}>Your recent searches will appear here</Text>
          </View>
        )}
      </View>
  );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        {isSearchFocused && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setIsSearchFocused(false);
              setSearchQuery('');
              Keyboard.dismiss();
            }}
          >
            <Ionicons name="arrow-back" size={22} color={theme.primary} />
          </TouchableOpacity>
        )}
        <View style={[styles.searchBar, { 
          backgroundColor: theme.surface, 
          borderColor: isSearchFocused ? theme.primary : theme.border,
          flex: isSearchFocused ? 1 : 1 
        }]}>
          <Ionicons name="search" size={20} color={theme.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for quizzes..."
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={18} color={theme.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
        {isSearchFocused && (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {
              handleSearch();
            }}
          >
            <Text style={[styles.searchButtonText, { color: '#007AFF' }]}>Search</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {isSearchFocused ? (
        <View style={[styles.resultsContainer, { backgroundColor: theme.background }]}>
          {searchQuery.length > 0 ? (
            searchSuggestions.length > 0 ? renderSearchSuggestions() : null
          ) : (
            renderRecentSearches()
          )}
        </View>
      ) : (
        <View style={[styles.resultsContainer, { backgroundColor: theme.background }]}>
          {searchQuery.length > 0 && (
            <View style={[styles.searchCategoriesContainer, { borderBottomColor: theme.border }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity 
                  style={[styles.categoryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => {/* Add functionality for tag search */}}
                >
                  <Ionicons name="pricetag-outline" size={16} color={theme.primary} />
                  <Text style={[styles.categoryButtonText, { color: theme.text }]}>Tags</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.categoryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => {/* Add functionality for user search */}}
                >
                  <Ionicons name="person-outline" size={16} color={theme.primary} />
                  <Text style={[styles.categoryButtonText, { color: theme.text }]}>Users</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.categoryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => {/* Add functionality for trending search */}}
                >
                  <Ionicons name="trending-up-outline" size={16} color={theme.primary} />
                  <Text style={[styles.categoryButtonText, { color: theme.text }]}>Trending</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
          
        {isSearching ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>Searching...</Text>
          </View>
        ) : (
            <QuizList
              quizzes={searchResults}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
          </View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  suggestionsContainer: {
    flex: 1,
    borderRadius: 10,
    margin: 16,
    overflow: 'hidden',
  },
  suggestionsHeader: {
    padding: 10,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 16,
  },
  recentSearchesContainer: {
    flex: 1,
    borderRadius: 10,
    margin: 16,
    overflow: 'hidden',
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 14,
  },
  recentSearchesList: {
    flexGrow: 0,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  recentSearchIcon: {
    marginRight: 10,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
  },
  removeRecentSearch: {
    padding: 4,
  },
  seeMoreButton: {
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  seeMoreText: {
    fontSize: 15,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  searchButton: {
    paddingHorizontal: 10,
    height: 40,
    justifyContent: 'center',
    marginLeft: 6,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  searchCategoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 18,
    marginRight: 10,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default SearchScreen; 