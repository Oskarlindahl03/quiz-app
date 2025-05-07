import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  BackHandler,
  Platform,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Share,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { getQuizById, likeQuiz, addComment, deleteComment } from '../../services/quiz_service';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import apiClient from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface QuizPreviewScreenProps {
  quizId: string;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  createdBy?: string;
  category?: string;
  difficulty?: string;
  questions?: any[];
  createdAt?: string;
  comments?: Comment[];
  likes?: number;
}

interface Comment {
  id?: string;
  _id?: string;
  text: string;
  username: string;
  createdAt: string;
}

const QuizPreviewScreen: React.FC<QuizPreviewScreenProps> = ({ quizId }) => {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [keyboardShowing, setKeyboardShowing] = useState(false);

  // Create refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const commentSectionRef = useRef<View>(null);
  const commentInputRef = useRef<TextInput>(null);

  // Handle back button for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // If keyboard is open, close it instead of navigating
        if (isInputFocused) {
          Keyboard.dismiss();
          setIsInputFocused(false);
          return true;
        }
        
        // Otherwise navigate to home screen
        router.replace('/');
        return true; // Prevent default behavior
      });

      // Clean up when component unmounts
      return () => backHandler.remove();
    }
  }, [router, isInputFocused]);

  // Add keyboard handling
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardShowing(true);
        // Scroll to comments when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardShowing(false);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Load quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuizById(quizId);
        setQuiz(quizData as unknown as Quiz);
        // Initialize with any existing comments from the server
        if ((quizData as any).comments) {
          setComments((quizData as any).comments);
        }
        // Initialize like count
        setLikeCount((quizData as any).likes || 0);
        
        // We'll check the liked state in a separate useEffect
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Check if user has liked this quiz before - with improved error handling
  useEffect(() => {
    const checkLikedStatus = async () => {
      try {
        if (!user) return;
        
        // Use either id or _id depending on your user object structure
        const userId = user.id || (user as any)._id;
        
        if (!userId) {
          console.log("No user ID found");
          return;
        }
        
        console.log(`Checking liked status for user ${userId} and quiz ${quizId}`);
        const storageKey = `user_likes_${userId}`;
        const likedQuizzes = await AsyncStorage.getItem(storageKey);
        
        if (likedQuizzes) {
          try {
            const likedQuizzesArray = JSON.parse(likedQuizzes);
            console.log("Liked quizzes from storage:", likedQuizzesArray);
            const hasLiked = likedQuizzesArray.includes(quizId);
            console.log(`User has ${hasLiked ? 'liked' : 'not liked'} this quiz before`);
            setLiked(hasLiked);
          } catch (parseError) {
            console.error("Error parsing liked quizzes JSON:", parseError);
            // If JSON parsing fails, reset the storage
            await AsyncStorage.setItem(storageKey, JSON.stringify([]));
          }
        } else {
          console.log("No liked quizzes found in storage, initializing empty array");
          await AsyncStorage.setItem(storageKey, JSON.stringify([]));
        }
      } catch (error) {
        console.error('Error checking liked status:', error);
      }
    };

    if (user) {
      checkLikedStatus();
    }
  }, [quizId, user]);

  const handlePlayQuiz = () => {
    router.push(`/quiz/${quizId}`);
  };

  const handleGoBack = () => {
    router.replace('/');
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this quiz: ${quiz?.title}! Play it in the Quiz App.`,
        title: quiz?.title || 'Interesting Quiz'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the quiz');
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      // Add comment to the server
      const username = user?.username || 'Anonymous';
      const response = await addComment(quizId, comment, username);
      
      // Add comment locally with server-generated ID if available
      const newComment: Comment = {
        id: (response as { id?: string }).id || Date.now().toString(),
        text: comment,
        username,
        createdAt: new Date().toISOString()
      };
      
      setComments([newComment, ...comments]);
      setComment('');
      Keyboard.dismiss();
      setIsInputFocused(false);
    } catch (err) {
      console.error('Error posting comment:', err);
      Alert.alert('Error', 'Failed to post your comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like quizzes.');
      return;
    }

    // Get user ID (either id or _id)
    const userId = user.id || (user as any)._id;
    if (!userId) {
      Alert.alert('Error', 'Unable to identify user. Please try signing in again.');
      return;
    }

    // Toggle the like state
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    // Update count optimistically 
    setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      // Update like status on the server
      await likeQuiz(quizId, newLikedState);

      // Storage key for this user's likes
      const storageKey = `user_likes_${userId}`;
      
      // Save liked status in AsyncStorage
      const likedQuizzesString = await AsyncStorage.getItem(storageKey);
      let likedQuizzesArray = [];
      
      if (likedQuizzesString) {
        try {
          likedQuizzesArray = JSON.parse(likedQuizzesString);
        } catch (e) {
          console.error("Error parsing liked quizzes, resetting", e);
          likedQuizzesArray = [];
        }
      }
      
      if (newLikedState) {
        // Add to liked quizzes if not already there
        if (!likedQuizzesArray.includes(quizId)) {
          likedQuizzesArray.push(quizId);
        }
      } else {
        // Remove from liked quizzes
        likedQuizzesArray = likedQuizzesArray.filter((id: string) => id !== quizId);
      }
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(likedQuizzesArray));
      console.log(`Updated liked quizzes in storage: ${JSON.stringify(likedQuizzesArray)}`);
    } catch (err) {
      // Revert on error
      console.error("Error updating like status:", err);
      setLiked(!newLikedState);
      setLikeCount(prev => !newLikedState ? prev + 1 : Math.max(0, prev - 1));
      Alert.alert('Error', 'Could not update like status');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // Show confirmation dialog
    console.log(`Attempting to delete comment with ID: ${commentId} from quiz: ${quizId}`);
    
    Alert.alert(
      "Delete Comment", 
      "Are you sure you want to delete this comment?",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              // Call API to delete comment
              console.log(`Confirmed deletion of comment: ${commentId} from quiz: ${quizId}`);
              await deleteComment(quizId, commentId);
              
              // Update local state to remove the comment
              setComments(prevComments => 
                prevComments.filter(comment => {
                  const commentHasId = comment.id ? (comment.id !== commentId) : true;
                  const commentHas_id = comment._id ? (comment._id !== commentId) : true;
                  return commentHasId && commentHas_id;
                })
              );
            } catch (err) {
              console.error('Error deleting comment:', err);
              Alert.alert('Error', 'Failed to delete your comment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToComments = () => {
    if (scrollViewRef.current && commentSectionRef.current) {
      commentSectionRef.current.measureLayout(
        scrollViewRef.current.getInnerViewNode(),
        (_, y) => {
          scrollViewRef.current?.scrollTo({ y, animated: true });
          // Focus the input after scrolling
          setTimeout(() => {
            commentInputRef.current?.focus();
          }, 300);
        },
        () => console.log("Failed to measure")
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !quiz) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error || 'Quiz not found'}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.primary }]}
          onPress={handleGoBack}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = quiz.createdAt 
    ? new Date(quiz.createdAt).toLocaleDateString()
    : 'Unknown date';

  const quizCardColor = isDarkMode ? '#442C4A' : '#E3D4ED';

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButtonSmall}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Quiz Preview</Text>
          <View style={styles.placeholder} />
        </View>
        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: 16, 
              paddingBottom: keyboardShowing ? 120 : 80 
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.previewCard, { backgroundColor: quizCardColor }]}>
              <View style={styles.quizHeader}>
                <Text style={[styles.title, { color: theme.text }]}>{quiz.title}</Text>
                {quiz.createdBy && (
                  <Text style={[styles.createdBy, { color: theme.secondaryText }]}>
                    Created by @{quiz.createdBy}
                  </Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="help-circle-outline" size={20} color={theme.text} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {quiz.questions?.length || 0} Questions
                  </Text>
                </View>
                
                {quiz.difficulty && (
                  <View style={styles.infoItem}>
                    <Ionicons name="fitness-outline" size={20} color={theme.text} />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                      {quiz.difficulty}
                    </Text>
                  </View>
                )}
                
                {quiz.category && (
                  <View style={styles.infoItem}>
                    <Ionicons name="pricetag-outline" size={20} color={theme.text} />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                      {quiz.category}
                    </Text>
                  </View>
                )}
              </View>

              {quiz.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={[styles.descriptionTitle, { color: theme.text }]}>Description</Text>
                  <Text style={[styles.description, { color: theme.text }]}>{quiz.description}</Text>
                </View>
              )}

              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={theme.secondaryText} />
                <Text style={[styles.dateText, { color: theme.secondaryText }]}>
                  Created on {formattedDate}
                </Text>
              </View>
              
              <View style={styles.playSection}>
                <TouchableOpacity 
                  style={[styles.playButton, { backgroundColor: theme.primary }]}
                  onPress={handlePlayQuiz}
                >
                  <Ionicons name="play" size={20} color="#FFFFFF" style={styles.playIcon} />
                  <Text style={styles.playButtonText}>Start Quiz</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.interactionBar, { backgroundColor: theme.card }]}>
              <TouchableOpacity 
                style={styles.interactionButton}
                onPress={handleLike}
              >
                <Ionicons 
                  name={liked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={liked ? "#FF3B30" : theme.text} 
                />
                <Text style={[styles.interactionText, { color: theme.secondaryText }]}>
                  {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.interactionButton}
                onPress={scrollToComments}
              >
                <Ionicons name="chatbubble-outline" size={24} color={theme.text} />
                <Text style={[styles.interactionText, { color: theme.secondaryText }]}>
                  {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.interactionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={24} color={theme.text} />
                <Text style={[styles.interactionText, { color: theme.secondaryText }]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>

            <View ref={commentSectionRef} style={{ marginTop: 16 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Comments</Text>
              
              {comments.length > 0 ? (
                comments.map((comment, index) => {
                  const commentId = comment.id || comment._id || index.toString();
                  const isUserComment = user && comment.username === user.username;
                  
                  return (
                    <View 
                      key={commentId} 
                      style={[
                        styles.commentItem, 
                        { backgroundColor: theme.surface },
                      ]}
                    >
                      <View style={styles.commentHeader}>
                        <Text style={[styles.commentUsername, { color: theme.primary }]}>
                          @{comment.username}
                        </Text>
                        <View style={styles.commentActions}>
                          <Text style={[styles.commentDate, { color: theme.secondaryText }]}>
                            {formatDate(comment.createdAt)}
                          </Text>
                          
                          {isUserComment && (
                            <TouchableOpacity 
                              onPress={() => handleDeleteComment(commentId)}
                              style={styles.deleteButton}
                            >
                              <Ionicons name="trash-outline" size={16} color={theme.error} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text style={[styles.commentText, { color: theme.text }]}>
                        {comment.text}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noCommentsContainer}>
                  <Ionicons name="chatbubble-outline" size={24} color={theme.secondaryText} />
                  <Text style={[styles.noCommentsText, { color: theme.secondaryText }]}>
                    No comments yet. Be the first to share your thoughts!
                  </Text>
                </View>
              )}
              
              <View style={{ height: 60 }} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
        
        <View style={[
          styles.commentInputWrapper, 
          { 
            backgroundColor: theme.background,
            borderTopColor: theme.border 
          }
        ]}>
          <View style={[
            styles.commentInputContainer, 
            { 
              backgroundColor: theme.surface,
              borderColor: isInputFocused ? theme.primary : theme.border
            }
          ]}>
            <TextInput
              ref={commentInputRef}
              style={[styles.commentInput, { color: theme.text }]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.secondaryText}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={1}
              maxLength={300}
              onFocus={() => {
                setIsInputFocused(true);
                // Scroll to comments when input is focused
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              onBlur={() => setIsInputFocused(false)}
            />
            <TouchableOpacity 
              style={[styles.submitButton, { 
                backgroundColor: theme.primary,
                opacity: comment.trim() ? 1 : 0.5 
              }]}
              onPress={handleSubmitComment}
              disabled={!comment.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButtonSmall: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  previewCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quizHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 6,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  interactionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentsList: {
    marginBottom: 16,
  },
  commentItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noCommentsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCommentsText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  commentInputWrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
    maxHeight: 80,
  },
  playSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    width: width * 0.7,
    maxWidth: 240,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default QuizPreviewScreen; 