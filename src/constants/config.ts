/**
 * Application Configuration Constants
 */

// API Configuration
export const API = {
  BASE_URL: process.env.API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 60000, // 60 seconds for file uploads
};

// App-wide settings
export const APP_CONFIG = {
  APP_NAME: 'Quiz App',
  VERSION: '1.0.0',
  DEFAULT_QUIZ_TIME: 15, // Default time per question in seconds
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
};

// Quiz Settings
export const QUIZ_CONFIG = {
  MAX_QUESTIONS: 50,
  MIN_QUESTIONS: 1,
  DIFFICULTY_LEVELS: ['Easy', 'Medium', 'Hard'],
  DEFAULT_DIFFICULTY: 'Medium',
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@QuizApp:token',
  USER_DATA: '@QuizApp:user',
  QUIZ_HISTORY: '@QuizApp:history',
  QUIZ_DRAFTS: '@QuizApp:drafts',
  SETTINGS: '@QuizApp:settings',
}; 