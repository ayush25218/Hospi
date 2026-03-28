import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';
import { UserModel, type UserRole } from '../user/user.model.js';
import type { z } from 'zod';
import type { loginSchema, registerSchema } from './auth.validation.js';

type RegisterPayload = z.infer<typeof registerSchema>['body'];
type LoginPayload = z.infer<typeof loginSchema>['body'];

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

function signToken(userId: string, role: UserRole, email: string, name: string) {
  return jwt.sign(
    { userId, role, email, name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']> },
  );
}
