import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Must be registered LAST in Express middleware stack
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Known operational errors (our own AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Supabase/PostgreSQL errors
  if (err.message.includes('duplicate key')) {
    res.status(409).json({ error: 'A record with this value already exists.' });
    return;
  }

  // Multer file errors
  if (err.message.includes('File too large')) {
    res.status(413).json({ error: 'File size exceeds the 5MB limit.' });
    return;
  }

  // Generic server error (don't leak details in production)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
  });
};
