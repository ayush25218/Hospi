import { z } from 'zod';
import { userRoles } from '../user/user.model.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.email().transform((value) => value.toLowerCase()),
    phone: z.string().trim().optional(),
    password: z.string().min(8),
    role: z.enum(userRoles),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
  }),
});
