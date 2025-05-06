const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { uploadQuestionImage } = require('../middleware/upload.middleware');

// Get all quizzes
router.get('/', quizController.getAllQuizzes);

// Get a single quiz by ID
router.get('/:id', quizController.getQuizById);

// Create a new quiz
router.post('/', quizController.createQuiz);

// Update a quiz
router.put('/:id', quizController.updateQuiz);

// Delete a quiz
router.delete('/:id', quizController.deleteQuiz);

// Upload question image
router.post('/upload', uploadQuestionImage, quizController.uploadQuestionImage);

module.exports = router; 