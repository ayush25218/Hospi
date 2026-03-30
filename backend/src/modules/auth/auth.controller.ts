import type { Request, Response } from 'express';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPasswordWithToken,
} from './auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'auth.register',
    entityType: 'user',
    entityId: result.user.id,
    summary: `Created ${result.user.role} account for ${result.user.email}`,
    metadata: {
      role: result.user.role,
    },
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'User registered successfully',
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  await recordAuditEvent({
    req,
    actor: {
      id: result.user._id,
      role: result.user.role,
      email: result.user.email,
      name: result.user.name,
    },
    action: 'auth.login',
    entityType: 'session',
    entityId: result.user._id,
    summary: `Successful login for ${result.user.email}`,
  });

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

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestPasswordReset(req.body);

  await recordAuditEvent({
    req,
    action: 'auth.password-reset.requested',
    entityType: 'password-reset',
    summary: `Password reset requested for ${req.body.email}`,
    metadata: {
      email: req.body.email,
      previewAvailable: Boolean(result.resetUrl),
    },
  });

  sendResponse({
    res,
    message: 'If the account exists, password reset instructions have been prepared.',
    data: result,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await resetPasswordWithToken(req.body);

  await recordAuditEvent({
    req,
    actor: {
      id: result.user._id,
      role: result.user.role,
      email: result.user.email,
      name: result.user.name,
    },
    action: 'auth.password-reset.completed',
    entityType: 'user',
    entityId: result.user._id,
    summary: `Password reset completed for ${result.user.email}`,
  });

  sendResponse({
    res,
    message: 'Password reset successful',
    data: result,
  });
});
