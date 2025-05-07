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
      .select('title description category difficulty createdBy createdAt')
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
 * Upload a question image
 * @route POST /api/quizzes/upload-image
 * @access Public
 */
exports.uploadQuestionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'No image file provided'
      });
    }
    
    // Return the image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log(`Upload successful, image URL: ${imageUrl}`);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while uploading image' 
    });
  }
};

/**
 * Like a quiz
 * @route POST /api/quizzes/:id/like
 * @access Public
 */
exports.likeQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { liked } = req.body;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        error: true, 
        message: 'Quiz not found' 
      });
    }

    // Update the likes count based on the liked action
    if (liked) {
      // Increment likes
      quiz.likes = (quiz.likes || 0) + 1;
    } else {
      // Decrement likes, but don't go below 0
      quiz.likes = Math.max(0, (quiz.likes || 0) - 1);
    }

    await quiz.save();
    
    res.status(200).json({
      likes: quiz.likes,
      message: 'Quiz like status updated successfully'
    });
  } catch (error) {
    console.error('Error updating quiz like status:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while updating like status' 
    });
  }
};

/**
 * Add a comment to a quiz
 * @route POST /api/quizzes/:id/comments
 * @access Public
 */
exports.addComment = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { text, username } = req.body;

    // Validate comment data
    if (!text || !username) {
      return res.status(400).json({
        error: true,
        message: 'Comment text and username are required'
      });
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        error: true, 
        message: 'Quiz not found' 
      });
    }

    // Create and add the comment
    const newComment = {
      text,
      username,
      createdAt: new Date()
    };

    // Add to comments array
    if (!quiz.comments) {
      quiz.comments = [];
    }
    quiz.comments.unshift(newComment);

    await quiz.save();
    
    res.status(201).json({
      id: newComment._id,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Server error while adding comment' 
    });
  }
};

/**
 * Delete a comment from a quiz
 * @route DELETE /api/quizzes/:id/comments/:commentId
 * @access Public
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id: quizId, commentId } = req.params;

    console.log(`Deleting comment: quizId=${quizId}, commentId=${commentId}`);
    console.log('Request params:', req.params);
    console.log('Request URL:', req.originalUrl);

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        error: true, 
        message: 'Quiz not found' 
      });
    }

    // Check if quiz has comments array
    if (!quiz.comments || quiz.comments.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'No comments found for this quiz'
      });
    }

    // Debug comments array
    console.log('Comments to search through:', JSON.stringify(
      quiz.comments.map(c => ({ id: c._id.toString(), text: c.text.substring(0, 20) }))
    ));

    // Find the comment - comparing strings to avoid ObjectID issues
    let foundComment = false;
    let commentIndex = -1;
    
    for (let i = 0; i < quiz.comments.length; i++) {
      const comment = quiz.comments[i];
      const commentIdStr = comment._id.toString();
      
      console.log(`Comment #${i}: ID=${commentIdStr}, comparing with requested ID=${commentId}`);
      
      if (commentIdStr === commentId) {
        commentIndex = i;
        foundComment = true;
        break;
      }
    }

    if (!foundComment || commentIndex === -1) {
      return res.status(404).json({
        error: true,
        message: `Comment not found with ID: ${commentId}`
      });
    }

    console.log(`Found comment at index ${commentIndex}, removing it`);

    // Remove the comment from the array
    quiz.comments.splice(commentIndex, 1);
    await quiz.save();

    res.status(200).json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while deleting comment'
    });
  }
}; 