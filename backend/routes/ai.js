const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Create cache directory if it doesn't exist
const cacheDir = path.join(__dirname, '../cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Simple quiz cache
const quizCache = new Map();

// Load existing cache from disk if available
try {
  const cacheFile = path.join(cacheDir, 'quiz-cache.json');
  if (fs.existsSync(cacheFile)) {
    const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    Object.entries(cacheData).forEach(([key, value]) => {
      quizCache.set(key, value);
    });
    console.log(`Loaded ${quizCache.size} quizzes from cache`);
  }
} catch (error) {
  console.error('Error loading cache:', error);
}

// Save cache to disk periodically
function saveCache() {
  try {
    const cacheData = {};
    quizCache.forEach((value, key) => {
      cacheData[key] = value;
    });
    
    const cacheFile = path.join(cacheDir, 'quiz-cache.json');
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    console.log(`Saved ${quizCache.size} quizzes to cache`);
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

// Save cache every 5 minutes and when the process exits
setInterval(saveCache, 5 * 60 * 1000);
process.on('exit', saveCache);
process.on('SIGINT', () => {
  saveCache();
  process.exit();
});

/**
 * Generate quiz using OpenAI
 * POST /api/ai/generate-quiz
 */
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, numQuestions = 3, difficulty = 'medium' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Quiz topic is required' });
    }

    // Validate inputs
    if (numQuestions < 3 || numQuestions > 5) {
      return res.status(400).json({ message: 'Number of questions must be between 3 and 5' });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ message: 'Difficulty must be easy, medium, or hard' });
    }

    // Generate cache key based on parameters
    const cacheKey = generateCacheKey(topic, numQuestions, difficulty);
    
    // Check if we have a cached result
    if (quizCache.has(cacheKey)) {
      console.log(`Cache hit for quiz: ${topic} (${difficulty}, ${numQuestions} questions)`);
      return res.json(quizCache.get(cacheKey));
    }

    console.log(`Cache miss for quiz: ${topic} (${difficulty}, ${numQuestions} questions)`);

    // OpenAI API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Create the prompt for OpenAI
    const prompt = createPrompt(topic, numQuestions, difficulty);
    
    // Make request to OpenAI API with optimized parameters
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo', // Use cheaper model instead of GPT-4
        messages: [
          { 
            role: 'system', 
            content: 'Generate concise quiz content in exact JSON format. Focus on factual accuracy.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4, // Lower temperature for more deterministic output
        max_tokens: 1000, // Limit max tokens to reduce costs
        top_p: 0.9, // Slightly reduce sampling for more focused output
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // Extract and parse the response
    const message = response.data.choices[0].message.content;
    let quizData;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = message.match(/```json([\s\S]*?)```/) || message.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        quizData = JSON.parse(jsonString.trim());
      } else {
        quizData = JSON.parse(message);
      }
      
      // Validate the structure
      if (!quizData.title || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz format');
      }
      
      // Add default description if missing
      if (!quizData.description) {
        quizData.description = `A ${difficulty} quiz about ${topic}`;
      }
      
      // Store in cache
      quizCache.set(cacheKey, quizData);
      
      // Return the quiz data
      return res.json(quizData);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', message);
      return res.status(500).json({ message: 'Failed to parse AI-generated quiz' });
    }
  } catch (error) {
    console.error('Error generating quiz:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Quiz generation failed. Please try again.' });
  }
});

/**
 * Generate a cache key from quiz parameters
 */
function generateCacheKey(topic, numQuestions, difficulty) {
  // Normalize inputs for consistent caching
  const normalizedTopic = topic.trim().toLowerCase();
  const normalizedDifficulty = difficulty.trim().toLowerCase();
  
  // Create a string to hash
  const str = `${normalizedTopic}|${numQuestions}|${normalizedDifficulty}`;
  
  // Generate a hash for the cache key
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Create optimized prompt for OpenAI to generate a quiz
 */
function createPrompt(topic, numQuestions, difficulty) {
  return `Create a ${difficulty} difficulty ${numQuestions}-question quiz about "${topic}".
Format as JSON:
{
  "title":"${topic} Quiz",
  "description":"A ${difficulty} difficulty quiz on ${topic}",
  "questions":[{
    "question":"Question text",
    "options":["A","B","C","D"],
    "correctAnswer":0,
    "explanation":"Why A is correct"
  }]
}
Requirements:
1. ${numQuestions} questions on ${topic} at ${difficulty} level
2. Each question: 4 options, exactly one correct
3. correctAnswer = index of correct option (0-3)
4. Brief explanation for correct answer
5. Focus on ${difficultyGuidelines(difficulty)}`;
}

/**
 * Get specific guidelines based on difficulty
 */
function difficultyGuidelines(difficulty) {
  switch (difficulty) {
    case 'easy':
      return 'basic concepts accessible to beginners';
    case 'medium':
      return 'moderate knowledge and some specific details';
    case 'hard':
      return 'advanced concepts and detailed knowledge';
    default:
      return 'appropriate difficulty level';
  }
}

module.exports = router; 