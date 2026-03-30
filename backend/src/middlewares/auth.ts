import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getOrCreateDefaultOrganization } from '../modules/organization/organization.service.js';
import { UserModel, type UserRole, userRoles } from '../modules/user/user.model.js';
import { AppError } from '../utils/app-error.js';

const jwtPayloadSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(userRoles),
  email: z.string().email(),
  name: z.string().min(1),
  organizationId: z.string().min(1),
  organizationSlug: z.string().min(1),
  organizationName: z.string().min(1),
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
      const user = await UserModel.findById(decodedToken.userId).populate('organization');

      if (!user || !user.isActive) {
        throw new AppError('User account is not available', 401);
      }

      if (!user.organization) {
        const defaultOrganization = await getOrCreateDefaultOrganization();
        user.organization = defaultOrganization._id;
        await user.save();
        await user.populate('organization');
      }

      const organization = isResolvedOrganization(user.organization) ? user.organization : null;

      if (!organization) {
        throw new AppError('User organization could not be resolved', 401);
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
        organizationId: String(organization._id),
        organizationSlug: String(organization.slug),
        organizationName: String(organization.name),
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

function isResolvedOrganization(
  value: unknown,
): value is { _id: unknown; slug: string; name: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    'slug' in value &&
    typeof (value as { slug?: unknown }).slug === 'string' &&
    'name' in value &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}
