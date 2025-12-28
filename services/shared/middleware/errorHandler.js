import { createLogger } from '../utils/logger.js';

const logger = createLogger('error-handler');

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, statusCode = 500, context = {}) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validation error
 */
export class ValidationError extends APIError {
  constructor(message, errors = []) {
    super(message, 400, { errors });
  }
}

/**
 * Not found error
 */
export class NotFoundError extends APIError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  if (err instanceof APIError) {
    logger.error(err.message, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      context: err.context
    });
  } else {
    logger.error('Unexpected error', {
      error: err.message || err,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Determine response
  let statusCode = 500;
  let message = 'Internal server error';
  let context = {};

  if (err instanceof APIError) {
    statusCode = err.statusCode;
    message = err.message;
    context = err.context;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      ...context
    }
  });
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation middleware factory
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.errors) {
        next(new ValidationError('Validation failed', error.errors));
      } else {
        next(new ValidationError(error.message));
      }
    }
  };
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
}

export default errorHandler;
