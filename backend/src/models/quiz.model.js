const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    }
  }],
  explanation: {
    type: String,
    trim: true,
    default: '',
  }
}, { timestamps: true });

// Define comment schema
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  questions: [questionSchema],
  createdBy: {
    type: String,
    default: 'Anonymous',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  // Add comments array to quiz schema
  comments: [commentSchema],
  // Add likes field
  likes: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Add text indexes for search
quizSchema.index({ title: 'text', description: 'text', category: 'text' });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 