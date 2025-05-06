const Quiz = require('../models/quiz.model');
const path = require('path');
const fs = require('fs');

/**
 * Get all quizzes
 * @route GET /api/quizzes
 * @access Public
 */
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .select('title description category difficulty createdAt')
      .sort({ createdAt: -1 });
    
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while fetching quizzes' 
    });
  }
};

/**
 * Get a single quiz by ID
 * @route GET /api/quizzes/:id
 * @access Public
 */
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ 
        error: true, 
        message: 'Quiz not found' 
      });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while fetching quiz' 
    });
  }
};

/**
 * Create a new quiz
 * @route POST /api/quizzes
 * @access Public
 */
exports.createQuiz = async (req, res) => {
  try {
    const quizData = req.body;
    
    // Basic validation
    if (!quizData.title || !quizData.questions || quizData.questions.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Quiz title and at least one question are required'
      });
    }

    // Validate each question has text and options
    for (const question of quizData.questions) {
      if (!question.text || !question.options || question.options.length < 2) {
        return res.status(400).json({
          error: true,
          message: 'Each question must have text and at least 2 options'
        });
      }
      
      // Ensure at least one correct answer per question
      const hasCorrectOption = question.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        return res.status(400).json({
          error: true,
          message: 'Each question must have at least one correct answer'
        });
      }
    }

    const newQuiz = new Quiz(quizData);
    const savedQuiz = await newQuiz.save();
    
    res.status(201).json({
      id: savedQuiz._id,
      title: savedQuiz.title,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while creating quiz' 
    });
  }
};

/**
 * Update an existing quiz
 * @route PUT /api/quizzes/:id
 * @access Public
 */
exports.updateQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const updates = req.body;
    
    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        error: true, 
        message: 'Quiz not found' 
      });
    }

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId, 
      updates, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      id: updatedQuiz._id,
      title: updatedQuiz.title,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while updating quiz' 
    });
  }
};

/**
 * Delete a quiz
 * @route DELETE /api/quizzes/:id
 * @access Public
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        error: true, 
        message: 'Quiz not found' 
      });
    }

    // Delete the quiz
    await Quiz.findByIdAndDelete(quizId);
    
    res.status(200).json({
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while deleting quiz' 
    });
  }
};

/**
 * Handle question image upload
 * @route POST /api/quizzes/upload
 * @access Public
 */
exports.uploadQuestionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: true, 
        message: 'No image file uploaded' 
      });
    }

    // Get file path and create URL
    const relativeFilePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `${req.protocol}://${req.get('host')}/${relativeFilePath}`;
    
    // Return the file URL
    res.status(200).json({ 
      imageUrl: fileUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while uploading image' 
    });
  }
}; 