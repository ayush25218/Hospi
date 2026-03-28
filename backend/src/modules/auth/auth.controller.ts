import type { Request, Response } from 'express';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getCurrentUser, loginUser, registerUser } from './auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);

  sendResponse({
    res,
    statusCode: 201,
    message: 'User registered successfully',
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  sendResponse({
    res,
    message: 'Login successful',
    data: result,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);

  sendResponse({
    res,
    message: 'Current user fetched successfully',
    data: user,
  });
});
