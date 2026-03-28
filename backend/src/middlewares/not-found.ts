import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}
