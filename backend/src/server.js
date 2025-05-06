const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../env') });

// Import routes
const quizRoutes = require('./routes/quiz.routes');
const userRoutes = require('./routes/user.routes');

// Import middleware
const { notFound, errorHandler } = require('./middleware/error.middleware');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure CORS - more permissive for development
const corsOptions = {
  origin: '*', // Allow all origins in development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true
};

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);

// Debug route - print all request info
app.get('/api/debug', (req, res) => {
  console.log('Debug request received:');
  console.log('- Headers:', req.headers);
  console.log('- IP:', req.ip);
  res.status(200).json({ 
    status: 'OK', 
    message: 'Debug endpoint reached',
    headers: req.headers,
    ip: req.ip
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root route - for easy testing
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Quiz App API is running',
    version: '1.0.0',
    endpoints: [
      '/api/quizzes',
      '/api/debug',
      '/health'
    ]
  });
});

// 404 and Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-app')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
}); 