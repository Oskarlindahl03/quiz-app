import apiClient from './api';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

// Rate limiting configuration - commented out
// const RATE_LIMIT_KEY = 'ai_quiz_generation_timestamps';
// const MAX_GENERATIONS = 5; // Maximum number of generations per time window
// const TIME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if the user has exceeded their quota
 * @returns {Promise<{allowed: boolean, remainingTime: number}>} Whether generation is allowed and time until next allowed
 */
/* 
async function checkRateLimit(): Promise<{allowed: boolean, remainingTime: number}> {
  try {
    // Get stored timestamps of previous generations
    const storedTimestamps = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    let timestamps: number[] = storedTimestamps ? JSON.parse(storedTimestamps) : [];
    
    // Filter out timestamps older than the time window
    const now = Date.now();
    timestamps = timestamps.filter(time => now - time < TIME_WINDOW_MS);
    
    // If user hasn't reached the limit, allow generation
    if (timestamps.length < MAX_GENERATIONS) {
      // Add current timestamp and save
      timestamps.push(now);
      await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
      return { allowed: true, remainingTime: 0 };
    }
    
    // User has reached limit, calculate time until next allowed generation
    timestamps.sort((a, b) => a - b);
    const oldestTimestamp = timestamps[0];
    const timeUntilReset = TIME_WINDOW_MS - (now - oldestTimestamp);
    
    return { allowed: false, remainingTime: timeUntilReset };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // If there's an error, allow generation as fallback
    return { allowed: true, remainingTime: 0 };
  }
}
*/

/**
 * Format remaining time into a human-readable string
 */
/*
function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'now';
  
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
*/

/**
 * Generate a quiz using OpenAI
 * @param {string} topic - The quiz topic
 * @param {number} numQuestions - Number of questions to generate (default: 3)
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @returns {Promise<GeneratedQuiz>} Generated quiz data
 */
export const generateQuiz = async (
  topic: string, 
  numQuestions: number = 3, 
  difficulty: string = 'medium'
): Promise<GeneratedQuiz> => {
  try {
    // Comment out rate limit check
    // const { allowed, remainingTime } = await checkRateLimit();
    
    // if (!allowed) {
    //   const formattedTime = formatRemainingTime(remainingTime);
    //   throw new Error(`Quiz generation limit reached. Please try again in ${formattedTime}.`);
    // }
    
    // Ensure numQuestions is between 3 and 5
    const validatedNumQuestions = Math.min(Math.max(numQuestions, 3), 5);
    
    // For demo/testing, you can uncomment this to return a placeholder quiz
    return getMockQuiz(topic, validatedNumQuestions, difficulty);

    // Use the existing API client to make a request to your backend
    // which will proxy the request to OpenAI
    const response = await apiClient.post('/ai/generate-quiz', {
      topic,
      numQuestions: validatedNumQuestions,
      difficulty
    });
    
    console.log('Quiz generated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error generating quiz:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mock function to generate a quiz for testing without API
 * @param {string} topic - The quiz topic
 * @param {number} numQuestions - Number of questions to generate
 * @param {string} difficulty - Difficulty level
 * @returns {GeneratedQuiz} Generated quiz data
 */
const getMockQuiz = (topic: string, numQuestions: number, difficulty: string): GeneratedQuiz => {
  const quiz: GeneratedQuiz = {
    title: `${topic} Quiz`,
    description: `A ${difficulty} quiz about ${topic}`,
    questions: []
  };

  for (let i = 0; i < numQuestions; i++) {
    quiz.questions.push({
      question: `Sample question ${i+1} about ${topic}?`,
      options: [
        `Option A for question ${i+1}`,
        `Option B for question ${i+1}`,
        `Option C for question ${i+1}`,
        `Option D for question ${i+1}`,
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is an explanation for question ${i+1}`
    });
  }

  return quiz;
}; 