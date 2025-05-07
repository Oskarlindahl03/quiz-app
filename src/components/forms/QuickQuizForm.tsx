import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { generateQuiz } from '@/services/ai_service';
import { createQuiz } from '@/services/quiz_service';
import { useTheme } from '@/context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

interface QuickQuizFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const QuickQuizForm: React.FC<QuickQuizFormProps> = ({ onSuccess, onCancel }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [difficulty, setDifficulty] = useState(1); // 0: easy, 1: medium, 2: hard
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for your quiz');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Get the difficulty level from the array
      const difficultyLevel = DIFFICULTY_LEVELS[difficulty];
      
      // Generate the quiz using AI service
      const generatedQuiz = await generateQuiz(topic.trim(), numQuestions, difficultyLevel);

      // Format the quiz for the createQuiz function
      const quizPayload = {
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        tags: [topic.trim(), difficultyLevel],
        questions: generatedQuiz.questions.map(q => ({
          text: q.question,
          options: q.options.map((option, index) => ({
            text: option,
            isCorrect: index === q.correctAnswer
          })),
          imageUrl: null
        }))
      };

      // Create the quiz in the database
      const createdQuiz = await createQuiz(quizPayload);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Navigate to home or show success message
      Alert.alert(
        "Quiz Created!",
        `Your AI-generated quiz "${generatedQuiz.title}" has been created successfully.`,
        [
          { 
            text: "View Quiz", 
            onPress: () => router.push(`/quiz/${createdQuiz._id}`) 
          },
          { 
            text: "Done", 
            onPress: () => router.push('/') 
          }
        ]
      );
    } catch (error: any) {
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.text }]}>AI Quick Quiz</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Generate a quiz with AI in seconds
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Quiz Topic</Text>
        <TextInput
          style={[
            styles.input, 
            { 
              color: theme.text,
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border
            }
          ]}
          placeholder="Enter a topic (e.g., Solar System, World War II)"
          placeholderTextColor={theme.textSecondary}
          value={topic}
          onChangeText={setTopic}
          editable={!isGenerating}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.text }]}>Number of Questions</Text>
          <Text style={[styles.valueText, { color: theme.primary }]}>{numQuestions}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={3}
          maximumValue={5}
          step={1}
          value={numQuestions}
          onValueChange={setNumQuestions}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.primary}
          disabled={isGenerating}
        />
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>3</Text>
          <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>4</Text>
          <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>5</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Difficulty Level</Text>
        <View style={styles.difficultyContainer}>
          {DIFFICULTY_LEVELS.map((level, index) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyOption,
                {
                  backgroundColor: difficulty === index ? theme.primary : theme.backgroundSecondary,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setDifficulty(index)}
              disabled={isGenerating}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: difficulty === index ? theme.white : theme.text }
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Limited to 5 AI-generated quizzes per day to preserve resources.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
          onPress={onCancel}
          disabled={isGenerating}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            styles.generateButton, 
            { backgroundColor: theme.primary, opacity: isGenerating ? 0.7 : 1 }
          ]}
          onPress={handleGenerateQuiz}
          disabled={isGenerating || !topic.trim()}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <>
              <Ionicons name="flash-outline" size={16} color={theme.white} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: theme.white }]}>Generate Quiz</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 14,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  generateButton: {
    flex: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});

export default QuickQuizForm; 