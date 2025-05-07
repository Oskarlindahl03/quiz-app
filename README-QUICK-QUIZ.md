# AI-Powered Quick Quiz Feature

This document provides instructions on how to set up and use the new AI-powered Quick Quiz feature in your Quiz app.

## Overview

The Quick Quiz feature allows users to generate quizzes using AI. Simply provide a topic, select the number of questions and difficulty level, and let AI create a complete quiz for you.

## Setup Instructions

### 1. Install Required Dependencies

```bash
npm install @react-native-community/slider axios
# or
yarn add @react-native-community/slider axios
```

### 2. Set up OpenAI API Key

To use the AI features, you need an OpenAI API key:

1. Sign up or log in at [OpenAI Platform](https://platform.openai.com/)
2. Go to API Keys section and create a new key
3. Add this key to your server environment variables as `OPENAI_API_KEY`

### 3. Backend Setup

Make sure your backend server has the proper route set up to handle AI quiz generation:

1. Install the required packages:
   ```bash
   npm install express axios
   # or
   yarn add express axios
   ```

2. Add the AI routes from the `backend/routes/ai.js` file to your Express app:
   ```js
   const aiRoutes = require('./routes/ai');
   app.use('/api/ai', aiRoutes);
   ```

3. Ensure your environment variable for `OPENAI_API_KEY` is set on the server.

### 4. Test the Feature

1. Navigate to the "Create Quiz" screen
2. Select "Quick Quiz"
3. Enter a topic, adjust the number of questions and difficulty level
4. Tap "Generate Quiz"

## How It Works

1. Frontend UI collects user inputs (topic, number of questions, difficulty)
2. Request is sent to your backend server's `/api/ai/generate-quiz` endpoint
3. Backend uses OpenAI's API to generate quiz content
4. The generated quiz is processed and stored in your database
5. Users can access and play the AI-generated quiz just like manually created quizzes

## Troubleshooting

- **"Server configuration error"**: Ensure your OPENAI_API_KEY is set properly on the server
- **"Failed to parse AI-generated quiz"**: Check server logs for the raw response from OpenAI
- **Slow Generation**: AI quiz generation can take 5-10 seconds depending on OpenAI API response times
- **Token Usage**: Monitor your OpenAI API usage to avoid unexpected costs

## Development Notes

### Using Mock Data

For development and testing without using the OpenAI API, you can use the mock function:

1. In the `src/services/ai_service.ts` file, uncomment this line in the `generateQuiz` function:
   ```typescript
   // return getMockQuiz(topic, numQuestions, difficulty);
   ```

2. This will return test data instead of making actual API calls.

### OpenAI Models

This implementation uses the 'gpt-3.5-turbo' model by default. For better quality but higher cost, you can change to 'gpt-4' in the backend.

## Future Enhancements

- Image generation for quiz questions
- Custom quiz templates
- Voice-to-quiz conversion
- Quiz refinement options 