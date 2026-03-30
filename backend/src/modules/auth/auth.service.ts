import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';
import { UserModel, type UserRole } from '../user/user.model.js';
import type { z } from 'zod';
import type {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.validation.js';

type RegisterPayload = z.infer<typeof registerSchema>['body'];
type LoginPayload = z.infer<typeof loginSchema>['body'];
type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>['body'];
type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>['body'];

export async function registerUser(payload: RegisterPayload) {
  const existingUser = await UserModel.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  const user = await UserModel.create(payload);
  const token = signToken(user.id, user.role as UserRole, String(user.email), String(user.name));

  return {
    token,
    user,
  };
}

export async function loginUser(payload: LoginPayload) {
  const user = await UserModel.findOne({ email: payload.email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await user.comparePassword(payload.password);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user.id, user.role as UserRole, String(user.email), String(user.name));
  const sanitizedUser = user.toJSON();

  return {
    token,
    user: sanitizedUser,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function requestPasswordReset(payload: ForgotPasswordPayload) {
  const user = await UserModel.findOne({ email: payload.email }).select('+passwordResetTokenHash +passwordResetExpiresAt');

  if (!user || !user.isActive) {
    return {
      requested: true,
    };
  }

  const token = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  return {
    requested: true,
    expiresAt: expiresAt.toISOString(),
    resetUrl:
      env.NODE_ENV === 'production'
        ? undefined
        : `${env.APP_BASE_URL.replace(/\/$/, '')}/reset-password?token=${token}`,
    resetToken: env.NODE_ENV === 'production' ? undefined : token,
  };
}

export async function resetPasswordWithToken(payload: ResetPasswordPayload) {
  const tokenHash = hashResetToken(payload.token);
  const user = await UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+password +passwordResetTokenHash +passwordResetExpiresAt');

  if (!user || !user.isActive) {
    throw new AppError('Password reset token is invalid or has expired', 400);
  }

  user.password = payload.password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  const token = signToken(user.id, user.role as UserRole, String(user.email), String(user.name));
  const sanitizedUser = user.toJSON();

  return {
    token,
    user: sanitizedUser,
  };
}

function signToken(userId: string, role: UserRole, email: string, name: string) {
  return jwt.sign(
    { userId, role, email, name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']> },
  );
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
