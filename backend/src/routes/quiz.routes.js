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

// Upload quiz question image
router.post('/upload-image', uploadQuestionImage, quizController.uploadQuestionImage);

// Update a quiz
router.put('/:id', quizController.updateQuiz);

// Delete a quiz
router.delete('/:id', quizController.deleteQuiz);

// Like a quiz
router.post('/:id/like', quizController.likeQuiz);

// Add a comment to a quiz
router.post('/:id/comments', quizController.addComment);

// Delete a comment from a quiz
router.delete('/:id/comments/:commentId', quizController.deleteComment);

module.exports = router; 