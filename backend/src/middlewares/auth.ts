import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { UserModel, type UserRole, userRoles } from '../modules/user/user.model.js';
import { AppError } from '../utils/app-error.js';

const jwtPayloadSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(userRoles),
  email: z.string().email(),
  name: z.string().min(1),
});

export function auth(...allowedRoles: UserRole[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader?.startsWith('Bearer ')) {
        throw new AppError('Authorization token is missing', 401);
      }

      const token = authorizationHeader.split(' ')[1];

      if (!token) {
        throw new AppError('Authorization token is missing', 401);
      }

      const decodedToken = jwtPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
      const user = await UserModel.findById(decodedToken.userId);

      if (!user || !user.isActive) {
        throw new AppError('User account is not available', 401);
      }

      const userRole = user.role as UserRole;
      const userEmail = String(user.email);
      const userName = String(user.name);

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        throw new AppError('You are not allowed to access this resource', 403);
      }

      req.user = {
        id: user.id,
        role: userRole,
        email: userEmail,
        name: userName,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
