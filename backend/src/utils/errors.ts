import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const reqUser = (req as unknown as { user?: { id?: string; role?: string } }).user;

  if (err instanceof ZodError) {
    logger.warn('Validation error', {
      action: `${req.method} ${req.path}`,
      userId: reqUser?.id,
      metadata: { issues: err.issues },
    });
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      action: `${req.method} ${req.path}`,
      userId: reqUser?.id,
      metadata: { statusCode: err.statusCode },
    });
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  logger.error(`Unhandled error: ${err.message}`, {
    action: `${req.method} ${req.path}`,
    userId: reqUser?.id,
    error: err.stack,
  });

  res.status(500).json({
    error: 'An internal server error occurred. Please try again later.',
  });
}
