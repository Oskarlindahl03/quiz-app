import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { generateQuiz } from '@/services/ai_service';
import { createQuiz } from '@/services/quiz_service';

export default function QuickQuiz() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGoBack = () => {
    router.push('/create-quiz-options');
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a quiz topic');
      return;
    }
    
    if (topic.length < 3) {
      Alert.alert('Error', 'Quiz topic must be at least 3 characters');
      return;
    }
    
    if (topic.length > 20) {
      Alert.alert('Error', 'Quiz topic cannot exceed 20 characters');
      return;
    }

    setIsGenerating(true);
    try {
      // For development, use the mock function by uncommenting this line in ai_service.ts
      // return getMockQuiz(topic, numQuestions, difficulty);
      
      const generatedQuiz = await generateQuiz(topic, numQuestions, difficulty);
      
      // Format the generated quiz to match your existing quiz format
      const formattedQuiz = {
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        category: topic,
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), // Capitalize first letter
        createdBy: user?.username || 'Anonymous',
        questions: generatedQuiz.questions.map(q => ({
          text: q.question,
          options: q.options.map((opt, index) => ({
            text: opt,
            isCorrect: index === q.correctAnswer
          })),
          explanation: q.explanation || '',
          imageUrl: null // AI-generated quizzes don't have images initially
        }))
      };
      
      // Save the generated quiz using the existing quiz service
      await createQuiz(formattedQuiz);
      
      setIsGenerating(false);
      Alert.alert(
        'Success', 
        'Quiz generated successfully!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error: any) {
      setIsGenerating(false);
      console.error('Error generating quiz:', error);
      Alert.alert('Error', 'Failed to generate quiz. Please try again.');
    }
  };

  const getDifficultyColor = (level: string): string => {
    if (difficulty === level) {
      switch (level) {
        case 'easy': return '#4CAF50';
        case 'medium': return '#FF9800';
        case 'hard': return '#F44336';
      }
    }
    return theme.border;
  };

  // Custom number selector instead of slider
  const decreaseQuestions = () => {
    if (numQuestions > 3) {
      setNumQuestions(numQuestions - 1);
    }
  };

  const increaseQuestions = () => {
    if (numQuestions < 5) {
      setNumQuestions(numQuestions + 1);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />
        
        {/* Header with back button */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity 
            onPress={handleGoBack} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Quick Quiz</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={[styles.optionCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Generate a Quiz Using AI</Text>
              
              <Text style={[styles.inputLabel, { color: theme.text }]}>Quiz Topic</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.border 
                }]}
                placeholder="Enter a quiz topic (e.g., World History)"
                placeholderTextColor={theme.secondaryText}
                value={topic}
                onChangeText={(text) => setTopic(text.slice(0, 20))}
                maxLength={20}
              />
              <Text style={[styles.characterCount, { color: theme.secondaryText }]}>
                {topic.length}/20 characters
              </Text>
              
              <Text style={[styles.inputLabel, { color: theme.text }]}>Number of Questions: {numQuestions}</Text>
              
              {/* Custom number selector */}
              <View style={styles.numberSelector}>
                <TouchableOpacity 
                  style={[styles.numberButton, { backgroundColor: theme.primary }]} 
                  onPress={decreaseQuestions}
                  disabled={numQuestions <= 3}
                >
                  <Ionicons name="remove" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <Text style={[styles.numberValue, { color: theme.text }]}>{numQuestions}</Text>
                
                <TouchableOpacity 
                  style={[styles.numberButton, { backgroundColor: theme.primary }]} 
                  onPress={increaseQuestions}
                  disabled={numQuestions >= 5}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.inputLabel, { color: theme.text }]}>Difficulty</Text>
              <View style={styles.difficultyContainer}>
                <TouchableOpacity 
                  style={[styles.difficultyButton, { borderColor: getDifficultyColor('easy') }]} 
                  onPress={() => setDifficulty('easy')}
                >
                  <Text style={[styles.difficultyText, { color: getDifficultyColor('easy') }]}>Easy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.difficultyButton, { borderColor: getDifficultyColor('medium') }]} 
                  onPress={() => setDifficulty('medium')}
                >
                  <Text style={[styles.difficultyText, { color: getDifficultyColor('medium') }]}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.difficultyButton, { borderColor: getDifficultyColor('hard') }]} 
                  onPress={() => setDifficulty('hard')}
                >
                  <Text style={[styles.difficultyText, { color: getDifficultyColor('hard') }]}>Hard</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.generateButton, 
                  { backgroundColor: isGenerating ? theme.secondaryText : theme.primary }
                ]} 
                onPress={handleGenerateQuiz}
                disabled={isGenerating || !topic.trim()}
              >
                {isGenerating ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.generateButtonText}>Generating Quiz...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={24} color="#FFFFFF" style={styles.generateIcon} />
                    <Text style={styles.generateButtonText}>Generate Quiz</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <Text style={[styles.noteText, { color: theme.secondaryText }]}>
                This will create a multiple-choice quiz based on your topic. The AI will generate questions, answer options, and explanations.
              </Text>
              
              {/* <Text style={[styles.rateLimit, { color: theme.secondaryText }]}>
                Note: Limited to 5 AI-generated quizzes per day to control API usage.
              </Text> */}
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: 50, // Add padding for status bar
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 40,
  },
  contentContainer: {
    padding: 16,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  numberSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberValue: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    width: '30%',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  generateIcon: {
    marginRight: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  rateLimit: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 