import type { Response } from 'express';

type ApiResponseOptions<T> = {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
};

export function sendResponse<T>({
  res,
  statusCode = 200,
  message,
  data,
}: ApiResponseOptions<T>) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}
