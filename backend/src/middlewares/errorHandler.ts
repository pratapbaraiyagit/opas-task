import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

import { env } from '@config/env';
import { ApiError } from '@utils/ApiError';
import { logger } from '@utils/logger';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const mongooseError = err as Error & { errors: Record<string, { message: string }> };
    const errors = Object.values(mongooseError.errors).map((e) => ({
      field: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as Error & { code: number }).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Duplicate entry. Resource already exists.',
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource ID format',
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  // Unhandled errors
  logger.error('Unhandled error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};
