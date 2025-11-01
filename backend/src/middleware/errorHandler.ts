import { Request, Response, NextFunction } from 'express';

/**
 * Global Error Handler Middleware
 *
 * Catches all errors thrown in the application and returns
 * a consistent error response format.
 */

interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  stack?: string;
  details?: any;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: err.message || 'Internal Server Error'
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        errorResponse.error = 'Duplicate entry';
        errorResponse.message = 'This record already exists';
        res.status(409).json(errorResponse);
        return;

      case '23503': // Foreign key violation
        errorResponse.error = 'Invalid reference';
        errorResponse.message = 'Referenced record does not exist';
        res.status(400).json(errorResponse);
        return;

      case '23502': // Not null violation
        errorResponse.error = 'Missing required field';
        errorResponse.message = 'A required field is missing';
        res.status(400).json(errorResponse);
        return;

      case '22P02': // Invalid text representation
        errorResponse.error = 'Invalid data format';
        errorResponse.message = 'Data format is incorrect';
        res.status(400).json(errorResponse);
        return;

      default:
        errorResponse.error = 'Database error';
        errorResponse.details = { code: err.code };
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json(errorResponse);
    return;
  }

  // Default to 500 Internal Server Error
  res.status(err.statusCode || 500).json(errorResponse);
};

/**
 * 404 Not Found Handler
 *
 * Catches all requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      experiences: '/api/experiences',
      bookings: '/api/bookings',
      promo: '/api/promo',
      health: '/health'
    }
  });
};
