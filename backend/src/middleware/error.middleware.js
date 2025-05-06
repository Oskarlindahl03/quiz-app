/**
 * Not found middleware
 * Handles 404 errors when a route is not found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Error handler middleware
 * Handles all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  // Check if response status is already set, otherwise set to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  // Prepare response object
  const errorResponse = {
    error: true,
    message: err.message,
  };
  
  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  // Send error response
  res.json(errorResponse);
};

module.exports = {
  notFound,
  errorHandler
}; 