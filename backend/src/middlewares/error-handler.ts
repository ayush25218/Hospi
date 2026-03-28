import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const normalizedError = normalizeError(error);
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    details: normalizedError.details ?? null,
    stack: isDevelopment ? normalizedError.stack : undefined,
  });
}

function normalizeError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError('Validation failed', 400, error.flatten());
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new AppError('Database validation failed', 400, error.errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  }

  if (isMongoDuplicateKeyError(error)) {
    return new AppError('Duplicate value detected', 409, error.keyValue);
  }

  const message = error instanceof Error ? error.message : 'Something went wrong';
  return new AppError(message, 500);
}

function isMongoDuplicateKeyError(
  error: unknown,
): error is { code: number; keyValue?: Record<string, unknown> } {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
